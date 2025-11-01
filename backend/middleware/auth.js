const jwt = require('jsonwebtoken');
const User = require('../models/User');
const protect = async (req, res, next) => {
  let token;
  if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
    try{
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      if(!req.user){
        return res.status(401).json({
          success: false,
          message: 'Not authorized - user not found',
        });
      }if(!req.user.isActive){
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated',
        });
      }next();
    }
    catch(error){
      console.error('Token verification error:', error);
      if(error.name=== 'JsonWebTokenError'){
        return res.status(401).json({
          success: false,
          message: 'Not authorized - invalid token',
        });
      }else if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Not authorized - token expired',
        });
      }return res.status(401).json({
        success: false,
        message: 'Not authorized - token failed',
      });
    }
  }
  if(!token){
    return res.status(401).json({
      success: false,
      message: 'Not authorized - no token provided',
    });
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized - user not authenticated',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`,
      });
    }

    next();
  };
};

// Optional auth - don't require token but set user if present
const optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      // Continue without setting user
      console.log('Optional auth failed:', error.message);
    }
  }

  next();
};

// Check if user owns resource
const checkOwnership = (resourceField = 'user') => {
  return (req, res, next) => {
    // This middleware should be used after protect middleware
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // Allow admins to access any resource
    if (req.user.role === 'admin') {
      return next();
    }

    // Check ownership based on the resource
    // This will be used in route handlers with resource-specific logic
    req.checkOwnership = {
      field: resourceField,
      userId: req.user._id,
    };

    next();
  };
};

// Verify specialist status
const verifySpecialist = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
  }

  if (req.user.role !== 'specialist') {
    return res.status(403).json({
      success: false,
      message: 'Specialist access required',
    });
  }

  // Check if specialist is verified
  if (!req.user.isVerified) {
    return res.status(403).json({
      success: false,
      message: 'Specialist verification required',
    });
  }

  next();
};

module.exports = {
  protect,
  authorize,
  optionalAuth,
  checkOwnership,
  verifySpecialist,
};