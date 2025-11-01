const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const Specialist = require('../models/specialist');  // Fix: lowercase 'specialist'
const { asyncHandler } = require('../middleware/errorHandler');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }

  const { name, email, password, role, specialization, licenseNumber, experience } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User with this email already exists',
    });
  }

  const userData = {
    name,
    email,
    password,
    role: role || 'patient',
  };

  if (role === 'specialist') {
    if (!specialization) {
      return res.status(400).json({
        success: false,
        message: 'Specialization is required for specialists',
      });
    }
    userData.specialization = specialization;
    userData.licenseNumber = licenseNumber;
    userData.experience = experience || 0;
    userData.isVerified = false;
  }

  try {
    const user = await User.create(userData);

    if (role === 'specialist') {
      await Specialist.create({
        user: user._id,
        verificationStatus: 'pending',
      });
    }

    await user.updateLastLogin();

    const token = generateToken(user._id);

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      specialization: user.specialization,
      isVerified: user.isVerified,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: userResponse,
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register user',
      error: error.message,
    });
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }

  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials',
    });
  }

  if (!user.isActive) {
    return res.status(401).json({
      success: false,
      message: 'Account is deactivated. Please contact support.',
    });
  }

  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials',
    });
  }

  try {
    await user.updateLastLogin();

    const token = generateToken(user._id);

    let specialistProfile = null;
    if (user.role === 'specialist') {
      specialistProfile = await Specialist.findOne({ user: user._id });
    }

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      specialization: user.specialization,
      isVerified: user.isVerified,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      profile: user.profile,
      specialistProfile: specialistProfile ? {
        verificationStatus: specialistProfile.verificationStatus,
        metrics: specialistProfile.metrics,
        isAvailable: specialistProfile.availability?.isAvailable,
      } : null,
    };

    res.json({
      success: true,
      message: 'Login successful',
      user: userResponse,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message,
    });
  }
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = req.user;

  let specialistProfile = null;
  if (user.role === 'specialist') {
    specialistProfile = await Specialist.findOne({ user: user._id })
      .populate('reviews.patient', 'name');
  }

  const userResponse = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    specialization: user.specialization,
    licenseNumber: user.licenseNumber,
    experience: user.experience,
    isVerified: user.isVerified,
    isActive: user.isActive,
    lastLogin: user.lastLogin,
    profile: user.profile,
    specialistProfile,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  res.json({
    success: true,
    user: userResponse,
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  const {
    name,
    phone,
    dateOfBirth,
    gender,
    address,
    specialization,
    experience,
  } = req.body;

  if (name) user.name = name;
  if (specialization && user.role === 'specialist') {
    user.specialization = specialization;
  }
  if (experience !== undefined && user.role === 'specialist') {
    user.experience = experience;
  }

  if (!user.profile) user.profile = {};
  if (phone) user.profile.phone = phone;
  if (dateOfBirth) user.profile.dateOfBirth = new Date(dateOfBirth);
  if (gender) user.profile.gender = gender;
  if (address) user.profile.address = { ...user.profile.address, ...address };

  await user.save();

  res.json({
    success: true,
    message: 'Profile updated successfully',
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      specialization: user.specialization,
      experience: user.experience,
      profile: user.profile,
      updatedAt: user.updatedAt,
    },
  });
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Current password and new password are required',
    });
  }

  const user = await User.findById(req.user.id).select('+password');

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    return res.status(400).json({
      success: false,
      message: 'Current password is incorrect',
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'New password must be at least 6 characters long',
    });
  }

  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: 'Password changed successfully',
  });
});

// @desc    Deactivate account
// @route   PUT /api/auth/deactivate
// @access  Private
const deactivateAccount = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  user.isActive = false;
  await user.save();

  res.json({
    success: true,
    message: 'Account deactivated successfully',
  });
});

// @desc    Get user statistics (admin only)
// @route   GET /api/auth/stats
// @access  Private/Admin
const getUserStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const activeUsers = await User.countDocuments({ isActive: true });
  const patients = await User.countDocuments({ role: 'patient' });
  const specialists = await User.countDocuments({ role: 'specialist' });
  const verifiedSpecialists = await User.countDocuments({
    role: 'specialist',
    isVerified: true
  });

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentRegistrations = await User.countDocuments({
    createdAt: { $gte: thirtyDaysAgo }
  });

  res.json({
    success: true,
    stats: {
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      patients,
      specialists,
      verifiedSpecialists,
      unverifiedSpecialists: specialists - verifiedSpecialists,
      recentRegistrations,
    },
  });
});

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  deactivateAccount,
  getUserStats,
};
