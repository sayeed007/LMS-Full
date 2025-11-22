const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Organization name is required'],
    trim: true,
    unique: true
  },
  email: {
    type: String,
    required: [true, 'Organization email is required'],
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: 'Please provide a valid email'
    }
  },
  type: {
    type: String,
    enum: {
      values: ['educational_institution', 'corporate', 'government', 'non_profit', 'other'],
      message: 'Type must be one of: educational_institution, corporate, government, non_profit, other'
    },
    required: [true, 'Organization type is required']
  },
  description: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  logo: {
    type: String,
    trim: true
  },
  address: {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    country: { type: String, trim: true },
    zipCode: { type: String, trim: true }
  },
  contactPerson: {
    name: { type: String, trim: true },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      validate: {
        validator: function(v) {
          if (!v) return true; // Optional field
          return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
        },
        message: 'Please provide a valid contact email'
      }
    },
    phone: { type: String, trim: true },
    position: { type: String, trim: true }
  },
  settings: {
    allowPublicCourses: { type: Boolean, default: true },
    requireApproval: { type: Boolean, default: false },
    customBranding: { type: Boolean, default: false }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
organizationSchema.index({ name: 1 });
organizationSchema.index({ type: 1 });
organizationSchema.index({ isActive: 1 });
organizationSchema.index({ email: 1 });

// Virtual for member count
organizationSchema.virtual('memberCount', {
  ref: 'User',
  localField: '_id',
  foreignField: 'organization',
  count: true
});

// Virtual for courses count
organizationSchema.virtual('coursesCount', {
  ref: 'Course',
  localField: '_id',
  foreignField: 'organization',
  count: true
});

const Organization = mongoose.model('Organization', organizationSchema);

module.exports = Organization;