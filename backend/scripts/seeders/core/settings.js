const Setting = require('../../../src/models/Setting');

const defaultSettings = {
  siteName: 'LMS Platform',
  siteDescription: 'Learning Management System',
  contactEmail: 'support@lms.com',
  allowRegistration: true,
  requireEmailVerification: false,
  defaultUserRole: 'student',
  coursesPerPage: 12,
  maxFileUploadSize: 150, // MB
  allowedFileTypes: ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.txt', '.xls', '.xlsx', '.jpg', '.jpeg', '.png', '.gif', '.mp4', '.mov'],
  timezone: 'UTC',
  dateFormat: 'YYYY-MM-DD',
  timeFormat: '24h',
  enableComments: true,
  enableRatings: true,
  enableCertificates: true,
  enableNotifications: true,
  maintenanceMode: false
};

async function seedSettings() {
  console.log('⚙️  Seeding system settings...');
  
  try {
    // Check if settings already exist
    let settings = await Setting.findOne();
    
    if (settings) {
      // Update existing settings
      settings = await Setting.findOneAndUpdate({}, defaultSettings, { new: true });
      console.log('✅ Updated system settings');
    } else {
      // Create new settings
      settings = await Setting.create(defaultSettings);
      console.log('✅ Created system settings');
    }
    
    return settings;
  } catch (error) {
    console.error('❌ Error seeding settings:', error.message);
    throw error;
  }
}

module.exports = { seedSettings, defaultSettings };
