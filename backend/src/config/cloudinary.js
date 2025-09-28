const cloudinary = require('cloudinary').v2;

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function to upload file to Cloudinary
const uploadToCloudinary = async (filePath, options = {}) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: 'auto', // Automatically detect file type (image, video, raw)
      folder: 'lms-content', // Organize files in a folder
      ...options
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      resourceType: result.resource_type,
      format: result.format,
      size: result.bytes
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('File upload failed');
  }
};

// Helper function to delete file from Cloudinary
const deleteFromCloudinary = async (publicId, resourceType = 'auto') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType
    });
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('File deletion failed');
  }
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
  deleteFromCloudinary
};