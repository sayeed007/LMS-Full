const mongoose = require('mongoose');

/**
 * Settings Model
 *
 * This model stores system-wide configuration settings.
 * Settings are organized by category for easy management.
 * Only one settings document should exist in the database (singleton pattern).
 */

const settingSchema = new mongoose.Schema({
  // General Settings
  general: {
    siteName: {
      type: String,
      default: 'LMS Platform',
      trim: true
    },
    siteDescription: {
      type: String,
      default: 'A comprehensive Learning Management System',
      trim: true
    },
    siteUrl: {
      type: String,
      default: 'http://localhost:3000',
      trim: true
    },
    logo: {
      type: String,
      default: ''
    },
    favicon: {
      type: String,
      default: ''
    },
    contactEmail: {
      type: String,
      default: 'support@lms.com',
      trim: true,
      lowercase: true
    },
    supportPhone: {
      type: String,
      default: '',
      trim: true
    },
    address: {
      type: String,
      default: '',
      trim: true
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    language: {
      type: String,
      default: 'en',
      enum: ['en', 'bn']
    },
    currency: {
      type: String,
      default: 'BDT',
      enum: ['BDT', 'USD', 'EUR']
    }
  },

  // Email Settings
  email: {
    enabled: {
      type: Boolean,
      default: false
    },
    service: {
      type: String,
      default: 'gmail',
      enum: ['gmail', 'smtp', 'sendgrid', 'ses']
    },
    host: {
      type: String,
      default: 'smtp.gmail.com',
      trim: true
    },
    port: {
      type: Number,
      default: 587
    },
    secure: {
      type: Boolean,
      default: false
    },
    username: {
      type: String,
      default: '',
      trim: true
    },
    password: {
      type: String,
      default: '',
      select: false // Don't include password in queries by default
    },
    fromEmail: {
      type: String,
      default: 'noreply@lms.com',
      trim: true,
      lowercase: true
    },
    fromName: {
      type: String,
      default: 'LMS Platform',
      trim: true
    }
  },

  // Payment Gateway Settings
  payment: {
    enabled: {
      type: Boolean,
      default: false
    },
    gateway: {
      type: String,
      default: 'sslcommerz',
      enum: ['sslcommerz', 'stripe', 'paypal']
    },
    mode: {
      type: String,
      default: 'sandbox',
      enum: ['sandbox', 'live']
    },
    sslcommerz: {
      storeId: {
        type: String,
        default: '',
        select: false
      },
      storePassword: {
        type: String,
        default: '',
        select: false
      },
      sandboxMode: {
        type: Boolean,
        default: true
      }
    },
    stripe: {
      publicKey: {
        type: String,
        default: '',
        select: false
      },
      secretKey: {
        type: String,
        default: '',
        select: false
      }
    },
    paypal: {
      clientId: {
        type: String,
        default: '',
        select: false
      },
      clientSecret: {
        type: String,
        default: '',
        select: false
      }
    },
    currency: {
      type: String,
      default: 'BDT'
    }
  },

  // System Settings
  system: {
    maintenanceMode: {
      type: Boolean,
      default: false
    },
    maintenanceMessage: {
      type: String,
      default: 'We are currently under maintenance. Please check back soon.'
    },
    registrationEnabled: {
      type: Boolean,
      default: true
    },
    courseApprovalRequired: {
      type: Boolean,
      default: true
    },
    allowGuestBrowsing: {
      type: Boolean,
      default: true
    },
    maxFileUploadSize: {
      type: Number,
      default: 10485760 // 10MB in bytes
    },
    sessionTimeout: {
      type: Number,
      default: 3600 // 1 hour in seconds
    },
    passwordMinLength: {
      type: Number,
      default: 8
    },
    passwordRequireUppercase: {
      type: Boolean,
      default: true
    },
    passwordRequireNumbers: {
      type: Boolean,
      default: true
    },
    passwordRequireSpecialChars: {
      type: Boolean,
      default: false
    }
  },

  // Features Settings
  features: {
    enableCertificates: {
      type: Boolean,
      default: true
    },
    enableMessaging: {
      type: Boolean,
      default: true
    },
    enableForums: {
      type: Boolean,
      default: false
    },
    enableReviews: {
      type: Boolean,
      default: true
    },
    enableWishlist: {
      type: Boolean,
      default: true
    },
    enableNotifications: {
      type: Boolean,
      default: true
    }
  },

  // Social Media Links
  social: {
    facebook: {
      type: String,
      default: '',
      trim: true
    },
    twitter: {
      type: String,
      default: '',
      trim: true
    },
    linkedin: {
      type: String,
      default: '',
      trim: true
    },
    instagram: {
      type: String,
      default: '',
      trim: true
    },
    youtube: {
      type: String,
      default: '',
      trim: true
    }
  },

  // SEO Settings
  seo: {
    metaTitle: {
      type: String,
      default: 'LMS Platform - Learn Anything, Anywhere'
    },
    metaDescription: {
      type: String,
      default: 'Join our learning platform to access thousands of courses and expand your knowledge.'
    },
    metaKeywords: {
      type: String,
      default: 'lms, learning, courses, education, online learning'
    },
    ogImage: {
      type: String,
      default: ''
    },
    googleAnalyticsId: {
      type: String,
      default: ''
    },
    facebookPixelId: {
      type: String,
      default: ''
    }
  },

  // Last updated information
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
settingSchema.index({ updatedAt: -1 });

// Static method to get or create settings (singleton pattern)
settingSchema.statics.getSettings = async function() {
  let settings = await this.findOne();

  // If no settings exist, create default settings
  if (!settings) {
    settings = await this.create({});
  }

  return settings;
};

// Static method to update settings
settingSchema.statics.updateSettings = async function(updates, userId) {
  let settings = await this.getSettings();

  // Merge updates
  Object.keys(updates).forEach(category => {
    if (settings[category] && typeof updates[category] === 'object') {
      Object.assign(settings[category], updates[category]);
    }
  });

  settings.lastUpdatedBy = userId;
  await settings.save();

  return settings;
};

// Method to get public settings (safe to expose to frontend)
settingSchema.methods.getPublicSettings = function() {
  return {
    general: {
      siteName: this.general.siteName,
      siteDescription: this.general.siteDescription,
      siteUrl: this.general.siteUrl,
      logo: this.general.logo,
      favicon: this.general.favicon,
      contactEmail: this.general.contactEmail,
      supportPhone: this.general.supportPhone,
      timezone: this.general.timezone,
      language: this.general.language,
      currency: this.general.currency
    },
    system: {
      maintenanceMode: this.system.maintenanceMode,
      maintenanceMessage: this.system.maintenanceMessage,
      registrationEnabled: this.system.registrationEnabled,
      allowGuestBrowsing: this.system.allowGuestBrowsing
    },
    features: this.features,
    social: this.social,
    seo: {
      metaTitle: this.seo.metaTitle,
      metaDescription: this.seo.metaDescription,
      metaKeywords: this.seo.metaKeywords,
      ogImage: this.seo.ogImage
    }
  };
};

const Setting = mongoose.model('Setting', settingSchema);

module.exports = Setting;
