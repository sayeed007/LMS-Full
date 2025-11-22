const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  certificateId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
    index: true
  },
  enrollment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enrollment',
    required: true
  },
  completionDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  finalScore: {
    type: Number,
    min: 0,
    max: 100
  },
  instructorName: {
    type: String,
    required: true
  },
  courseName: {
    type: String,
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  isRevoked: {
    type: Boolean,
    default: false
  },
  revokedAt: {
    type: Date
  },
  revokedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  revokeReason: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
certificateSchema.index({ student: 1, course: 1 });
certificateSchema.index({ certificateId: 1 });
certificateSchema.index({ isRevoked: 1 });

// Prevent duplicate certificates for same student and course
certificateSchema.index({ student: 1, course: 1 }, { unique: true });

const Certificate = mongoose.model('Certificate', certificateSchema);

module.exports = Certificate;
