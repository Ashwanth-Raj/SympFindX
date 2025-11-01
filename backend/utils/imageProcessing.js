const sharp = require('sharp');
const { uploadToCloudinary } = require('../config/cloudinary');

// Process image for ML model input
const processImageForML = async (imageBuffer) => {
  try {
    const processedBuffer = await sharp(imageBuffer)
      .resize(224, 224, {
        fit: 'cover',
        position: 'center',
      })
      .jpeg({
        quality: 95,
        progressive: true,
      })
      .toBuffer();

    return processedBuffer;
  } catch (error) {
    console.error('Image processing error:', error);
    throw new Error('Failed to process image for ML model');
  }
};

// Extract image metadata
const extractImageMetadata = async (imageBuffer) => {
  try {
    const metadata = await sharp(imageBuffer).metadata();

    return {
      format: metadata.format,
      width: metadata.width,
      height: metadata.height,
      channels: metadata.channels,
      density: metadata.density,
      hasAlpha: metadata.hasAlpha,
      size: imageBuffer.length,
    };
  } catch (error) {
    console.error('Metadata extraction error:', error);
    throw new Error('Failed to extract image metadata');
  }
};

// Create thumbnail
const createThumbnail = async (imageBuffer, width = 150, height = 150) => {
  try {
    const thumbnail = await sharp(imageBuffer)
      .resize(width, height, {
        fit: 'cover',
        position: 'center',
      })
      .jpeg({
        quality: 80,
      })
      .toBuffer();

    return thumbnail;
  } catch (error) {
    console.error('Thumbnail creation error:', error);
    throw new Error('Failed to create thumbnail');
  }
};

// Enhance image quality
const enhanceImage = async (imageBuffer) => {
  try {
    const enhanced = await sharp(imageBuffer)
      .sharpen()
      .normalize()
      .jpeg({
        quality: 90,
        progressive: true,
      })
      .toBuffer();

    return enhanced;
  } catch (error) {
    console.error('Image enhancement error:', error);
    throw new Error('Failed to enhance image');
  }
};

// Validate image for eye analysis
const validateEyeImage = async (imageBuffer) => {
  try {
    const metadata = await extractImageMetadata(imageBuffer);

    const validationResult = {
      isValid: true,
      issues: [],
      metadata,
    };

    // Minimum resolution
    if (metadata.width < 100 || metadata.height < 100) {
      validationResult.isValid = false;
      validationResult.issues.push(
        'Image resolution too low (minimum 100x100px)'
      );
    }

    // Very high resolution
    if (metadata.width > 4000 || metadata.height > 4000) {
      validationResult.issues.push(
        'Image resolution very high, consider resizing for faster processing'
      );
    }

    // File size
    if (metadata.size > 10 * 1024 * 1024) {
      validationResult.isValid = false;
      validationResult.issues.push('Image file too large (maximum 10MB)');
    }

    // Aspect ratio check
    const aspectRatio = metadata.width / metadata.height;
    if (aspectRatio < 0.5 || aspectRatio > 2.0) {
      validationResult.issues.push(
        'Unusual aspect ratio detected, ensure image shows eye clearly'
      );
    }

    // Color channels check
    if (metadata.channels < 3) {
      validationResult.issues.push(
        'Grayscale image detected, color images preferred for better analysis'
      );
    }

    return validationResult;
  } catch (error) {
    console.error('Image validation error:', error);
    return {
      isValid: false,
      issues: ['Failed to validate image'],
      metadata: null,
    };
  }
};

// Upload processed images to cloud
const uploadProcessedImages = async (originalBuffer, fileName = 'eye_image') => {
  try {
    const results = {};

    // Upload original image
    results.original = await uploadToCloudinary(
      originalBuffer,
      'sympfindx/originals'
    );

    // ML-ready version
    const mlBuffer = await processImageForML(originalBuffer);
    results.processed = await uploadToCloudinary(
      mlBuffer,
      'sympfindx/processed'
    );

    // Thumbnail
    const thumbnailBuffer = await createThumbnail(originalBuffer);
    results.thumbnail = await uploadToCloudinary(
      thumbnailBuffer,
      'sympfindx/thumbnails'
    );

    return results;
  } catch (error) {
    console.error('Image upload error:', error);
    throw new Error('Failed to upload processed images');
  }
};

// Convert buffer to base64
const bufferToBase64 = (buffer) => buffer.toString('base64');

// Prepare image for ML model
const prepareImageForML = async (imageBuffer) => {
  try {
    const processedBuffer = await processImageForML(imageBuffer);

    const base64Image = bufferToBase64(processedBuffer);

    const metadata = await extractImageMetadata(processedBuffer);

    return {
      base64: base64Image,
      metadata,
      format: 'jpeg',
      size: processedBuffer.length,
    };
  } catch (error) {
    console.error('ML preparation error:', error);
    throw new Error('Failed to prepare image for ML processing');
  }
};

// Image quality assessment
const assessImageQuality = async (imageBuffer) => {
  try {
    const metadata = await extractImageMetadata(imageBuffer);
    const stats = await sharp(imageBuffer).stats();

    const quality = {
      resolution: 'good',
      brightness: 'normal',
      contrast: 'normal',
      sharpness: 'unknown',
      overallScore: 0,
    };

    // Resolution
    const totalPixels = metadata.width * metadata.height;
    if (totalPixels < 50000) quality.resolution = 'poor';
    else if (totalPixels < 200000) quality.resolution = 'fair';
    else if (totalPixels > 1000000) quality.resolution = 'excellent';

    // Brightness
    const avgBrightness =
      stats.channels.reduce((sum, channel) => sum + channel.mean, 0) /
      stats.channels.length;

    if (avgBrightness < 50) quality.brightness = 'too_dark';
    else if (avgBrightness > 200) quality.brightness = 'too_bright';
    else if (avgBrightness >= 100 && avgBrightness <= 150)
      quality.brightness = 'optimal';

    // Contrast
    const avgStdDev =
      stats.channels.reduce((sum, channel) => sum + channel.stdev, 0) /
      stats.channels.length;

    if (avgStdDev < 30) quality.contrast = 'low';
    else if (avgStdDev > 80) quality.contrast = 'high';
    else quality.contrast = 'good';

    // Overall score
    const scores = {
      resolution: { poor: 20, fair: 40, good: 70, excellent: 100 },
      brightness: { too_dark: 30, too_bright: 40, normal: 70, optimal: 100 },
      contrast: { low: 40, normal: 70, good: 85, high: 60 },
    };

    quality.overallScore = Math.round(
      (scores.resolution[quality.resolution] +
        scores.brightness[quality.brightness] +
        scores.contrast[quality.contrast]) /
        3
    );

    return quality;
  } catch (error) {
    console.error('Quality assessment error:', error);
    return {
      resolution: 'unknown',
      brightness: 'unknown',
      contrast: 'unknown',
      sharpness: 'unknown',
      overallScore: 0,
    };
  }
};

module.exports = {
  processImageForML,
  extractImageMetadata,
  createThumbnail,
  enhanceImage,
  validateEyeImage,
  uploadProcessedImages,
  bufferToBase64,
  prepareImageForML,
  assessImageQuality,
};
