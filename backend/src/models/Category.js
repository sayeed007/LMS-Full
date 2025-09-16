const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true,
    minlength: [2, 'Category name must be at least 2 characters long'],
    maxlength: [100, 'Category name cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  icon: {
    type: String,
    default: 'folder'
  },
  color: {
    type: String,
    default: '#3B82F6'
  },
  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  courseCount: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create slug before saving
categorySchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '-');
  }
  this.updatedAt = new Date();
  next();
});

// Update the updatedAt field before updating
categorySchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

// Index for better query performance
categorySchema.index({ name: 1, isActive: 1 });
categorySchema.index({ slug: 1 });
categorySchema.index({ createdBy: 1 });

// Virtual for subcategories
categorySchema.virtual('subcategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parentCategory'
});

// Static method to get all active categories
categorySchema.statics.getActiveCategories = function() {
  return this.find({ isActive: true })
    .sort({ name: 1 })
    .populate('createdBy', 'firstName lastName')
    .select('-__v');
};

// Static method to get categories with course count
categorySchema.statics.getCategoriesWithStats = function() {
  return this.aggregate([
    {
      $match: { isActive: true }
    },
    {
      $lookup: {
        from: 'courses',
        localField: 'name',
        foreignField: 'category',
        as: 'courses'
      }
    },
    {
      $addFields: {
        courseCount: { $size: '$courses' }
      }
    },
    {
      $project: {
        courses: 0
      }
    },
    {
      $sort: { name: 1 }
    }
  ]);
};

// Instance method to get course count for this category
categorySchema.methods.getCourseCount = async function() {
  const Course = mongoose.model('Course');
  return await Course.countDocuments({
    category: this.name,
    isPublished: true
  });
};

// Instance method to update course count
categorySchema.methods.updateCourseCount = async function() {
  this.courseCount = await this.getCourseCount();
  return this.save();
};

module.exports = mongoose.model('Category', categorySchema);