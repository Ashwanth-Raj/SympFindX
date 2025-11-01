const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  // Basic information
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  specialist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  prediction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prediction',
    required: true,
  },
  // Report details
  reportData: {
    title: {
      type: String,
      required: true,
    },
    summary: {
      type: String,
      required: true,
      maxlength: [2000, 'Summary cannot exceed 2000 characters'],
    },
    findings: [{
      category: {
        type: String,
        enum: ['image_analysis', 'symptom_analysis', 'clinical_assessment', 'recommendation'],
        required: true,
      },
      title: String,
      description: String,
      severity: {
        type: String,
        enum: ['normal', 'mild', 'moderate', 'severe', 'critical'],
        default: 'normal',
      },
      confidence: {
        type: Number,
        min: 0,
        max: 1,
      },
    }],
    diagnosis: {
      primary: {
        condition: String,
        icd10Code: String,
        confidence: Number,
        description: String,
      },
      differential: [{
        condition: String,
        icd10Code: String,
        probability: Number,
        notes: String,
      }],
    },
  },
  // Clinical assessment (if reviewed by specialist)
  clinicalAssessment: {
    specialistNotes: String,
    additionalFindings: [String],
    modifiedDiagnosis: {
      condition: String,
      reasoning: String,
    },
    treatmentPlan: {
      immediate: [String],
      shortTerm: [String],
      longTerm: [String],
    },
    followUpRequired: {
      type: Boolean,
      default: false,
    },
    followUpDate: Date,
    followUpInstructions: String,
  },
  // Recommendations
  recommendations: {
    lifestyle: [String],
    medications: [{
      name: String,
      dosage: String,
      frequency: String,
      duration: String,
      instructions: String,
    }],
    procedures: [{
      name: String,
      urgency: {
        type: String,
        enum: ['routine', 'urgent', 'emergency'],
        default: 'routine',
      },
      description: String,
    }],
    referrals: [{
      specialistType: String,
      reason: String,
      urgency: {
        type: String,
        enum: ['routine', 'urgent', 'emergency'],
        default: 'routine',
      },
    }],
  },
  // Status and metadata
  status: {
    type: String,
    enum: ['draft', 'pending_review', 'completed', 'archived'],
    default: 'draft',
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal',
  },
  version: {
    type: Number,
    default: 1,
  },
  // Sharing and access
  sharing: {
    isShared: {
      type: Boolean,
      default: false,
    },
    sharedWith: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      permissions: {
        type: String,
        enum: ['view', 'edit', 'full'],
        default: 'view',
      },
      sharedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    publicLink: {
      token: String,
      isActive: {
        type: Boolean,
        default: false,
      },
      expiryDate: Date,
    },
  },
  // Quality metrics
  qualityMetrics: {
    aiAccuracy: Number,
    specialistConfidence: Number,
    patientSatisfaction: Number,
    reportCompleteness: {
      type: Number,
      min: 0,
      max: 100,
    },
  },
  // Audit trail
  auditTrail: [{
    action: {
      type: String,
      enum: ['created', 'updated', 'reviewed', 'shared', 'archived'],
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    changes: mongoose.Schema.Types.Mixed,
    notes: String,
  }],
  // Generation metadata
  generatedAt: {
    type: Date,
    default: Date.now,
  },
  generatedBy: {
    type: String,
    enum: ['ai', 'specialist', 'system'],
    default: 'ai',
  },
  processingTime: Number,
  isArchived: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Indexes for better query performance
reportSchema.index({ patient: 1, createdAt: -1 });
reportSchema.index({ specialist: 1 });
reportSchema.index({ prediction: 1 });
reportSchema.index({ status: 1 });
reportSchema.index({ priority: 1 });
reportSchema.index({ generatedAt: -1 });

// Virtual for report age
reportSchema.virtual('age').get(function() {
  return Date.now() - this.generatedAt.getTime();
});

// Method to add audit entry
reportSchema.methods.addAuditEntry = function(action, userId, changes = null, notes = '') {
  this.auditTrail.push({
    action,
    performedBy: userId,
    changes,
    notes,
  });
  return this;
};

// Method to share report
reportSchema.methods.shareWith = function(userId, permissions = 'view') {
  const existingShare = this.sharing.sharedWith.find(
    share => share.user.toString() === userId.toString()
  );
  
  if (existingShare) {
    existingShare.permissions = permissions;
    existingShare.sharedAt = new Date();
  } else {
    this.sharing.sharedWith.push({
      user: userId,
      permissions,
    });
  }
  
  this.sharing.isShared = true;
  return this;
};

// Method to calculate report completeness
reportSchema.methods.calculateCompleteness = function() {
  let score = 0;
  const maxScore = 100;
  
  // Basic report data (30 points)
  if (this.reportData.title) score += 5;
  if (this.reportData.summary) score += 15;
  if (this.reportData.findings.length > 0) score += 10;
  
  // Diagnosis (25 points)
  if (this.reportData.diagnosis.primary.condition) score += 15;
  if (this.reportData.diagnosis.differential.length > 0) score += 10;
  
  // Recommendations (25 points)
  if (this.recommendations.lifestyle.length > 0) score += 8;
  if (this.recommendations.medications.length > 0) score += 8;
  if (this.recommendations.procedures.length > 0) score += 9;
  
  // Clinical assessment (20 points) - if specialist reviewed
  if (this.specialist) {
    if (this.clinicalAssessment.specialistNotes) score += 10;
    if (this.clinicalAssessment.treatmentPlan.immediate.length > 0) score += 5;
    if (this.clinicalAssessment.followUpRequired !== undefined) score += 5;
  } else {
    score += 20; // Full points if no specialist review required
  }
  
  this.qualityMetrics.reportCompleteness = Math.min(score, maxScore);
  return this.qualityMetrics.reportCompleteness;
};

// Static method to get reports by patient
reportSchema.statics.getPatientReports = function(patientId, options = {}) {
  const { page = 1, limit = 10, status, priority } = options;
  const query = { patient: patientId };
  
  if (status) query.status = status;
  if (priority) query.priority = priority;
  
  return this.find(query)
    .populate('specialist', 'name specialization')
    .populate('prediction', 'predictions.combinedResult.finalDiagnosis createdAt')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

// Static method to get pending reports for specialists
reportSchema.statics.getPendingReports = function(specialistId) {
  return this.find({
    specialist: specialistId,
    status: 'pending_review',
  })
  .populate('patient', 'name email')
  .populate('prediction', 'predictions.combinedResult')
  .sort({ priority: 1, createdAt: 1 });
};

module.exports = mongoose.model('Report', reportSchema);