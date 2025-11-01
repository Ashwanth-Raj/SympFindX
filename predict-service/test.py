import os
import io
import numpy as np
import pickle
import tensorflow as tf
from flask import Flask, request, jsonify
from PIL import Image
import cv2

# Flask app
app = Flask(__name__)
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"

# Optional: GPU memory growth
try:
    gpus = tf.config.experimental.list_physical_devices("GPU")
    for g in gpus:
        try:
            tf.config.experimental.set_memory_growth(g, True)
        except Exception:
            pass
except Exception:
    pass

# -----------------------------
# Load models and components
# -----------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "models")

FUNDUS_MODEL_PATH = os.path.join(MODEL_DIR, "fundus_mnv2.keras")
OUTER_MODEL_PATH = os.path.join(MODEL_DIR, "outer_mnv2.keras")
SYMPTOM_MODEL_PATH = os.path.join(MODEL_DIR, "symptom_model.pkl")
COMPONENTS_PATH = os.path.join(MODEL_DIR, "components.pkl")

fundus_model = tf.keras.models.load_model(FUNDUS_MODEL_PATH, compile=False)
outer_model = tf.keras.models.load_model(OUTER_MODEL_PATH, compile=False)

with open(SYMPTOM_MODEL_PATH, "rb") as f:
    symptom_model = pickle.load(f)

with open(COMPONENTS_PATH, "rb") as f:
    components = pickle.load(f)


def resolve_classes(components, list_key, dict_key):
    if list_key in components:
        return list(components[list_key])
    if dict_key in components and isinstance(components[dict_key], dict):
        d = components[dict_key]
        try:
            keys = sorted(d.keys(), key=lambda k: int(k))
        except Exception:
            keys = sorted(d.keys())
        return [d[k] for k in keys]
    raise KeyError(f"Missing {list_key} or {dict_key} in components.pkl")


fundus_classes = resolve_classes(components, "fundus_classes", "fundus_class_dict")
outer_classes = resolve_classes(components, "outer_eye_classes", "outer_eye_class_dict")

vec = components.get("vectorizer", components.get("tfidf_vectorizer"))
le = components.get("label_encoder", components.get("le_text"))
if vec is None or le is None:
    raise KeyError("Missing vectorizer or label encoder in components.pkl")

IMG_SIZE = 224

# -----------------------------
# Utilities
# -----------------------------
def preprocess_image_bytes(file_bytes, img_size=IMG_SIZE):
    """Decode to RGB, resize, normalize -> (1, H, W, 3) float32 [0,1]."""
    bio = io.BytesIO(file_bytes)
    with Image.open(bio) as im:
        im = im.convert("RGB")
        im = im.resize((img_size, img_size), Image.BILINEAR)
        x = np.asarray(im, dtype=np.float32) / 255.0
    return np.expand_dims(x, 0)


def decode_bgr_from_bytes(file_bytes, max_side=640):
    """OpenCV decode (BGR), downscale for heuristics. Returns BGR uint8 or None."""
    arr = np.frombuffer(file_bytes, np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if img is None:
        return None
    h, w = img.shape[:2]
    scale = min(1.0, float(max_side) / max(h, w))
    if scale < 1.0:
        img = cv2.resize(img, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)
    return img


def softmax_scores(preds):
    """Return (top1, margin, entropy, order_desc) for logging/analytics (no rejection)."""
    p = preds.astype(np.float64)
    s = p.sum()
    p = (p / s) if s > 0 else np.ones_like(p) / max(1, len(p))
    order = np.argsort(p)[::-1]
    top1 = float(p[order[0]])
    margin = float(p[order[0]] - p[order[1]]) if len(p) > 1 else top1
    K = len(p)
    entropy = float(-np.sum(p * np.log(p + 1e-12)) / np.log(K))
    return top1, margin, entropy, order

# -----------------------------
# Heuristics (strict-enough): reject only non-eye images
# -----------------------------
haar_base = cv2.data.haarcascades
face_cascade = cv2.CascadeClassifier(os.path.join(haar_base, "haarcascade_frontalface_default.xml"))
eye_cascade = cv2.CascadeClassifier(os.path.join(haar_base, "haarcascade_eye_tree_eyeglasses.xml"))
if eye_cascade.empty():
    eye_cascade = cv2.CascadeClassifier(os.path.join(haar_base, "haarcascade_eye.xml"))


def detect_fundus_circle_relaxed(img_bgr):
    """Relaxed fundus check: circle allowed 20%–75% of min side and center within ~1.2 radii."""
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    gray = cv2.medianBlur(gray, 5)
    h, w = gray.shape[:2]
    min_r = max(8, int(min(h, w) * 0.20))
    max_r = int(min(h, w) * 0.75)
    circles = cv2.HoughCircles(
        gray,
        cv2.HOUGH_GRADIENT,
        dp=1.2,
        minDist=min(h, w) // 2,
        param1=100,
        param2=25,
        minRadius=min_r,
        maxRadius=max_r,
    )
    if circles is None:
        return None
    circles = np.round(circles[0, :]).astype("int")
    circles = sorted(circles, key=lambda c: c[2], reverse=True)
    x, y, r = circles[0]
    cx, cy = w // 2, h // 2
    center_dist = np.sqrt((x - cx) ** 2 + (y - cy) ** 2) / (r + 1e-6)
    r_ratio = r / float(min(h, w))
    return dict(x=int(x), y=int(y), r=int(r), r_ratio=float(r_ratio), center_dist=float(center_dist))


def fundus_circle_color_is_valid(img_bgr, circle):
    """
    Validate that the circle region looks like fundus: red/orange dominance.
    Uses mean BGR and HSV hue stats inside the circle mask.
    """
    if circle is None:
        return False, {"reason": "no_circle"}
    h, w = img_bgr.shape[:2]
    mask = np.zeros((h, w), dtype=np.uint8)
    cv2.circle(mask, (int(circle["x"]), int(circle["y"])), int(circle["r"]), 255, -1)

    mean_bgr = cv2.mean(img_bgr, mask=mask)[:3]  # (B, G, R)
    B, G, R = mean_bgr

    hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)
    H = hsv[:, :, 0]
    S = hsv[:, :, 1]
    mean_h = cv2.mean(H, mask=mask)[0]  # 0..180
    mean_s = cv2.mean(S, mask=mask)[0]  # 0..255

    red_dominant = (R > G + 15) and (R > B + 15)
    hue_warm = 5 <= mean_h <= 35         # warm tones
    sat_ok = mean_s >= 40                # moderate saturation

    ok = bool(red_dominant and hue_warm and sat_ok)
    info = {
        "mean_bgr": {"B": float(B), "G": float(G), "R": float(R)},
        "mean_h": float(mean_h),
        "mean_s": float(mean_s),
        "red_dominant": bool(red_dominant),
        "hue_warm": bool(hue_warm),
        "sat_ok": bool(sat_ok)
    }
    return ok, info


def skin_ratio_in_roi(roi_bgr):
    """
    Estimate human skin proportion in ROI using YCrCb thresholds.
    Returns ratio in [0,1].
    """
    if roi_bgr.size == 0:
        return 0.0
    ycrcb = cv2.cvtColor(roi_bgr, cv2.COLOR_BGR2YCrCb)
    skin_mask = cv2.inRange(ycrcb, (0, 133, 77), (255, 173, 127))
    ratio = float(np.count_nonzero(skin_mask)) / float(roi_bgr.shape[0] * roi_bgr.shape[1] + 1e-6)
    return ratio


def is_probably_eye_image(file_bytes):
    """
    Strict-enough 'eye present' check:
      - Accept if a fundus-like circle is detected AND its color profile is fundus-like (red/orange dominance).
      - OR accept if eyes are detected and:
          * combined eye area ≥ MIN_TOTAL_EYE_AREA_RATIO,
          * at least one pupil candidate is present,
          * skin proportion around eye ROI ≥ MIN_SKIN_RATIO.
      - Face-only is NOT sufficient (avoids passport/full-face).
    Return (bool, details).
    """
    img_bgr = decode_bgr_from_bytes(file_bytes)
    if img_bgr is None:
        return False, {"decoded": False}

    H, W = img_bgr.shape[:2]
    details = {"decoded": True, "fundus": None, "outer": None}

    # Fundus path
    fundus_info = detect_fundus_circle_relaxed(img_bgr)
    fundus_ok = False
    fundus_color_ok = False
    if fundus_info:
        geom_ok = (0.20 <= fundus_info["r_ratio"] <= 0.75) and (fundus_info["center_dist"] <= 1.2)
        if geom_ok:
            fundus_color_ok, _ = fundus_circle_color_is_valid(img_bgr, fundus_info)
            fundus_ok = bool(fundus_color_ok)

    details["fundus"] = {
        "geom_ok": bool(fundus_info is not None),
        "info": fundus_info,
        "color_ok": bool(fundus_color_ok),
        "ok": bool(fundus_ok)
    }

    # Outer-eye path
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    gray = cv2.equalizeHist(gray)
    eyes = eye_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=4, minSize=(18, 18))

    total_eye_area_ratio = 0.0
    pupil_ok = False
    max_skin_ratio = 0.0

    for (x, y, w, h) in eyes:
        area_ratio = (w * h) / float(W * H)
        total_eye_area_ratio += area_ratio

        roi = img_bgr[max(0, y):min(H, y + h), max(0, x):min(W, x + w)]
        if roi.size > 0:
            skin_ratio = skin_ratio_in_roi(roi)
            max_skin_ratio = max(max_skin_ratio, skin_ratio)

            gray_roi = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
            gray_roi = cv2.GaussianBlur(gray_roi, (5, 5), 0)
            rh, rw = gray_roi.shape[:2]
            min_r = max(3, int(min(rh, rw) * 0.04))
            max_r = max(5, int(min(rh, rw) * 0.18))
            circles = cv2.HoughCircles(
                gray_roi, cv2.HOUGH_GRADIENT, dp=1.2, minDist=min(rh, rw) // 2,
                param1=80, param2=12, minRadius=min_r, maxRadius=max_r
            )
            if circles is not None:
                pupil_ok = True

    # Thresholds (tune)
    MIN_TOTAL_EYE_AREA_RATIO = 0.03  # 3% of image area covered by eye bboxes
    MIN_SKIN_RATIO = 0.08            # >= 8% skin pixels inside eye ROI
    REQUIRE_PUPIL = True             # require a pupil candidate

    outer_ok = (
        (len(eyes) > 0) and
        (total_eye_area_ratio >= MIN_TOTAL_EYE_AREA_RATIO) and
        (max_skin_ratio >= MIN_SKIN_RATIO) and
        (pupil_ok if REQUIRE_PUPIL else True)
    )
    details["outer"] = {
        "eyes": int(len(eyes)),
        "total_eye_area_ratio": float(total_eye_area_ratio),
        "max_skin_ratio": float(max_skin_ratio),
        "pupil_ok": bool(pupil_ok),
        "ok": bool(outer_ok)
    }

    eye_like = bool(fundus_ok or outer_ok)
    return eye_like, details


def predict_symptoms(text):
    if not text or not text.strip():
        return None
    X = vec.transform([text])
    idx = symptom_model.predict(X)[0]
    return le.inverse_transform([idx])[0]

# -----------------------------
# Routes
# -----------------------------
@app.route("/api/health", methods=["GET"])
def health():
    return {"status": "ok"}


@app.route("/api/predict", methods=["POST"])
def api_predict():
    try:
        if "file" not in request.files:
            return jsonify({"ok": False, "error": "No file uploaded"}), 400

        fs = request.files["file"]

        # Inputs
        image_type = (request.form.get("image_type", "fundus") or "fundus").lower()
        if image_type == "outer_eye":
            image_type = "outer"
        symptoms = (request.form.get("symptoms", "") or "").strip()

        # Read bytes
        fs.stream.seek(0)
        file_bytes = fs.read()
        if not file_bytes:
            return jsonify({"ok": False, "error": "Empty upload"}), 400

        # Eye gate: reject ONLY non-eye images
        eye_like, heuristics = is_probably_eye_image(file_bytes)
        if not eye_like:
            return jsonify({
                "ok": False,
                "rejected": True,
                "reason": "This doesn’t look like an eye image. Please upload an eye close-up or a retinal (fundus) photo.",
                "heuristics": heuristics
            }), 200

        # Respect user's selected type
        decided_type = image_type if image_type in ("fundus", "outer") else "fundus"

        # Predict (no OOD rejection)
        batch = preprocess_image_bytes(file_bytes)
        if decided_type == "fundus":
            preds = fundus_model.predict(batch, verbose=0)[0]
            classes = fundus_classes
        else:
            preds = outer_model.predict(batch, verbose=0)[0]
            classes = outer_classes

        top1, margin, entropy, order = softmax_scores(preds)
        idx = int(order[0])
        main = classes[idx]
        conf = float(preds[idx])
        top3 = [{"label": classes[int(i)], "confidence": float(preds[int(i)])} for i in order[:3]]

        symptom_pred = predict_symptoms(symptoms) if symptoms else None
        agreement = bool(symptom_pred == main) if symptom_pred else False

        return jsonify({
            "ok": True,
            "rejected": False,
            "type": decided_type,
            "prediction": main,
            "confidence": conf,
            "top3": top3,
            "symptom_pred": symptom_pred,
            "symptom_agrees": agreement,
            "ood_scores": {"top1": top1, "margin": margin, "entropy": entropy},
            "heuristics": heuristics
        }), 200

    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "7000"))
    app.run(host="0.0.0.0", port=port, debug=True)
