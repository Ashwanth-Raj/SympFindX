const { upload, handleMulterError } = require('../config/multer');

// Single image upload middleware
const uploadSingleImage = (fieldName = 'image') => {
  return [
    upload.single(fieldName),
    handleMulterError,
    (req, res, next) => {
      // Validate that file was uploaded
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Please upload an image file',
        });
      }

      // Add file info to request for logging
      req.uploadInfo = {
        fieldName,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        uploadTime: new Date().toISOString(),
      };

      console.log('File upload info:', req.uploadInfo);
      next();
    }
  ];
};

// Multiple images upload middleware
const uploadMultipleImages = (fieldName = 'images', maxCount = 5) => {
  return [
    upload.array(fieldName, maxCount),
    handleMulterError,
    (req, res, next) => {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Please upload at least one image file',
        });
      }

      req.uploadInfo = {
        fieldName,
        fileCount: req.files.length,
        files: req.files.map(file => ({
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
        })),
        uploadTime: new Date().toISOString(),
      };

      console.log('Multiple files upload info:', req.uploadInfo);
      next();
    }
  ];
};

const validateImageSpecs = (options = {}) => {
const {
minWidth = 100,
minHeight = 100,
maxWidth = 4000,
maxHeight = 4000,
aspectRatioRange = [0.5, 2.0], // set to null to skip ratio checks
} = options;

return async (req, res, next) => {
if (!req.file && !req.files) {
return next();
}

const sharp = require('sharp');
const files = req.files || [req.file];

try {
  for (const file of files) {
    const metadata = await sharp(file.buffer).metadata();

    if (metadata.width < minWidth || metadata.height < minHeight) {
      return res.status(400).json({
        success: false,
        message: `Image too small. Minimum size: ${minWidth}x${minHeight}px`,
      });
    }

    if (metadata.width > maxWidth || metadata.height > maxHeight) {
      return res.status(400).json({
        success: false,
        message: `Image too large. Maximum size: ${maxWidth}x${maxHeight}px`,
      });
    }

    // Only enforce aspect ratio if a valid range is provided
    if (Array.isArray(aspectRatioRange) && aspectRatioRange.length === 2) {
      const aspectRatio = metadata.width / metadata.height;
      if (aspectRatio < aspectRatioRange[0] || aspectRatio > aspectRatioRange[1]) {
        return res.status(400).json({
          success: false,
          message: `Invalid aspect ratio. Must be between ${aspectRatioRange[0]} and ${aspectRatioRange[1]}`,
        });
      }
    }

    file.imageMetadata = metadata;
  }

  next();
} catch (error) {
  console.error('Image validation error:', error);
  return res.status(400).json({
    success: false,
    message: 'Invalid image format or corrupted file',
  });
}
};
};

// Preprocess image for ML model (pad to square to preserve content)
const preprocessImage = () => {
return async (req, res, next) => {
if (!req.file) {
return next();
}

const sharp = require('sharp');

try {
  // Contain & pad to 224x224 instead of cropping; avoids losing content on extreme ratios
  const processedBuffer = await sharp(req.file.buffer)
    .resize(224, 224, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 1 } // black padding; you can switch to white
    })
    .jpeg({
      quality: 90,
      progressive: true
    })
    .toBuffer();

  req.file.processed = {
    buffer: processedBuffer,
    mimetype: 'image/jpeg',
    size: processedBuffer.length,
  };

  console.log('Image preprocessed for ML model (padded 224x224)');
  next();
} catch (error) {
  console.error('Image preprocessing error:', error);
  return res.status(500).json({
    success: false,
    message: 'Error processing image for analysis',
  });
}
};
};



// Security checks for uploaded images
const securityCheck = () => {
  return async (req, res, next) => {
    if (!req.file && !req.files) {
      return next();
    }

    const files = req.files || [req.file];

    try {
      for (const file of files) {
        // Check for embedded executables or scripts
        const header = file.buffer.slice(0, 100).toString('hex');
        
        // Check for common executable signatures
        const dangerousSignatures = [
          '4d5a', // PE executable
          '7f454c46', // ELF executable
          '504b0304', // ZIP file (could contain scripts)
        ];

        if (dangerousSignatures.some(sig => header.startsWith(sig))) {
          return res.status(400).json({
            success: false,
            message: 'Potentially dangerous file detected',
          });
        }

        // Verify it's actually an image by checking magic bytes
        const imageSignatures = {
          'ffd8ff': 'jpeg',
          '89504e47': 'png',
          '47494638': 'gif',
          '52494646': 'webp',
        };

        const isValidImage = Object.keys(imageSignatures).some(sig => 
          header.startsWith(sig)
        );

        if (!isValidImage) {
          return res.status(400).json({
            success: false,
            message: 'Invalid image file format',
          });
        }
      }

      next();
    } catch (error) {
      console.error('Security check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error performing security checks',
      });
    }
  };
};

module.exports = {
  uploadSingleImage,
  uploadMultipleImages,
  validateImageSpecs,
  preprocessImage,
  securityCheck,
};