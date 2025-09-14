const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Organization name is required'],
    trim: true
  },
  description: String,
  website: String,
  logo: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const Organization = mongoose.model('Organization', organizationSchema);

module.exports = Organization;