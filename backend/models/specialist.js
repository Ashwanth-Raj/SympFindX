const mongoose = require('mongoose');

const specialistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // Professional details
  professionalInfo: {
    qualifications: [{
      degree: String,
      institution: String,
      year: Number,
    }],
    certifications: [{
      name: String,
      issuedBy: String,
      issueDate: Date,
      expiryDate: Date,
      certificateNumber: String,
    }],
    medicalLicenses: [{
      licenseNumber: String,
      issuingAuthority: String,
      issueDate: Date,
      expiryDate: Date,
      status: {
        type: String,
        enum: ['active', 'expired', 'suspended', 'revoked'],
        default: 'active',
      },
    }],
  },
  // Practice information
  practiceInfo: {
    clinicName: String,
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String,
    },
    contactInfo: {
      phone: String,
      email: String,
      website: String,
    },
    workingHours: [{
      day: {
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      },
      startTime: String,
      endTime: String,
      isAvailable: Boolean,
    }],
    consultationFee: {
      amount: Number,
      currency: {
        type: String,
        default: 'USD',
      },
    },
  },
  // Availability and scheduling
  availability: {
    isAvailable: {
      type: Boolean,
      default: true,
    },
    maxPatientsPerDay: {
      type: Number,
      default: 20,
    },
    appointmentDuration: {
      type: Number,
      default: 30, // in minutes
    },
    advanceBookingDays: {
      type: Number,
      default: 30,
    },
  },
  // Performance metrics
  metrics: {
    totalConsultations: {
      type: Number,
      default: 0,
    },
    completedConsultations: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    responseTime: {
      type: Number,
      default: 0, // Average response time in hours
    },
    patientSatisfaction: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  // Reviews and ratings
  reviews: [{
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: String,
    isVerified: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  // Status and verification
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected', 'suspended'],
    default: 'pending',
  },
  verificationDate: Date,
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  // Consultation preferences
  consultationPreferences: {
    acceptsEmergencies: {
      type: Boolean,
      default: true,
    },
    preferredCommunication: {
      type: String,
      enum: ['video', 'audio', 'text', 'any'],
      default: 'video',
    },
    languagesSpoken: [String],
    specialInterests: [String],
  },
}, {
  timestamps: true,
});

// Indexes for better query performance
specialistSchema.index({ user: 1 });
specialistSchema.index({ 'user.specialization': 1 });
specialistSchema.index({ 'availability.isAvailable': 1 });
specialistSchema.index({ verificationStatus: 1 });
specialistSchema.index({ 'metrics.averageRating': -1 });

// Virtual for completion rate
specialistSchema.virtual('completionRate').get(function() {
  if (this.metrics.totalConsultations === 0) return 0;
  return (this.metrics.completedConsultations / this.metrics.totalConsultations) * 100;
});

// Method to add a review
specialistSchema.methods.addReview = async function(patientId, rating, comment) {
  this.reviews.push({
    patient: patientId,
    rating,
    comment,
    isVerified: true,
  });
  
  // Update average rating
  const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
  this.metrics.averageRating = totalRating / this.reviews.length;
  
  return await this.save();
};

// Method to update consultation metrics
specialistSchema.methods.updateConsultationMetrics = async function(isCompleted = true) {
  this.metrics.totalConsultations += 1;
  if (isCompleted) {
    this.metrics.completedConsultations += 1;
  }
  
  return await this.save();
};

// Static method to find available specialists by specialization
specialistSchema.statics.findAvailableBySpecialization = function(specialization) {
  return this.find({
    'availability.isAvailable': true,
    verificationStatus: 'verified',
    isActive: true,
  }).populate({
    path: 'user',
    match: { specialization: specialization },
    select: 'name email specialization experience',
  }).then(specialists => 
    specialists.filter(specialist => specialist.user)
  );
};

// Static method to get top-rated specialists
specialistSchema.statics.getTopRated = function(limit = 10) {
  return this.find({
    verificationStatus: 'verified',
    isActive: true,
    'metrics.averageRating': { $gte: 4.0 },
  })
  .populate('user', 'name specialization experience')
  .sort({ 'metrics.averageRating': -1, 'metrics.totalConsultations': -1 })
  .limit(limit);
};

module.exports = mongoose.model('Specialist', specialistSchema);