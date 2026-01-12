const mongoose = require('mongoose');
const slugify = require('slugify');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a course title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  subtitle: {
    type: String,
    maxlength: [200, 'Subtitle cannot be more than 200 characters']
  },
  slug: {
    type: String,
    unique: true,
    index: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [5000, 'Description cannot be more than 5000 characters']
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    trim: true,
    // No enum - categories are dynamic and managed via Category collection
    validate: {
      validator: async function(value) {
        // Only validate if Category model is available
        try {
          const Category = require('./Category');
          const category = await Category.findOne({ name: value, isActive: true });
          return !!category;
        } catch (error) {
          // If Category model not available or error, skip validation
          return true;
        }
      },
      message: 'Please select a valid category'
    }
  },
  level: {
    type: String,
    required: [true, 'Please select a difficulty level'],
    enum: ['Beginner', 'Intermediate', 'Expert', 'All Levels']
  },
  language: {
    type: String,
    default: 'English'
  },
  thumbnail: {
    type: String,
    default: ''
  },
  promotionalVideo: {
    type: String
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: [0, 'Price must be at least 0']
  },
  discountPrice: {
    type: Number,
    validate: {
      validator: function(val) {
        return !val || val < this.price;
      },
      message: 'Discount price ({VALUE}) must be less than regular price'
    }
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  prerequisites: [{
    type: String,
    trim: true
  }],
  learningOutcomes: [{
    type: String,
    trim: true
  }],
  tags: [{
    type: String,
    trim: true
  }],
  
  // Status
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedAt: Date,
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Statistics (Cached)
  averageRating: {
    type: Number,
    min: [0, 'Rating must be at least 0'],
    max: [5, 'Rating must can not be more than 5'],
    default: 0
  },
  ratingCount: {
    type: Number,
    default: 0
  },
  enrollmentCount: {
    type: Number,
    default: 0
  },
  totalDuration: {
    type: Number, // in minutes
    default: 0
  },
  lessonCount: {
    type: Number,
    default: 0
  },
  
  // Settings
  settings: {
    requiresEnrollment: { type: Boolean, default: true },
    isFree: { type: Boolean, default: false },
    hasCertificate: { type: Boolean, default: true },
    dripContent: { type: Boolean, default: false }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
courseSchema.index({ title: 'text', description: 'text' });
courseSchema.index({ category: 1 });
courseSchema.index({ price: 1 });
courseSchema.index({ averageRating: -1 });

// Slug generation
courseSchema.pre('save', function(next) {
  if (!this.isModified('title')) {
    next();
    return;
  }
  this.slug = slugify(this.title, { lower: true, strict: true });
  
  // Checking for duplicates is usually handled by the unique index error or specific controller logic
  // Simple slugify is sufficient for now
  next();
});

// Virtual: Modules
courseSchema.virtual('modules', {
  ref: 'Module',
  localField: '_id',
  foreignField: 'course',
  options: { sort: { order: 1 } }
});

// Virtual: Enrollments
courseSchema.virtual('enrollments', {
  ref: 'Enrollment',
  localField: '_id',
  foreignField: 'course'
});

// Virtual: Reviews (Assuming Review model exists)
courseSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'course'
});

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;