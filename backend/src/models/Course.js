const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Resource title is required'],
    trim: true
  },
  url: {
    type: String,
    required: [true, 'Resource URL is required']
  },
  type: {
    type: String,
    enum: ['pdf', 'video', 'link', 'document', 'image', 'audio'],
    required: [true, 'Resource type is required']
  },
  size: Number, // in bytes
  duration: Number, // for video/audio resources in seconds
  downloadable: {
    type: Boolean,
    default: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Lesson title is required'],
    trim: true,
    maxlength: [100, 'Lesson title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Lesson description cannot exceed 500 characters']
  },
  content: {
    type: String,
    required: [true, 'Lesson content is required']
  },
  type: {
    type: String,
    enum: ['text', 'video', 'quiz', 'assignment', 'live', 'download'],
    default: 'text',
    required: [true, 'Lesson type is required']
  },
  order: {
    type: Number,
    required: [true, 'Lesson order is required'],
    min: [1, 'Lesson order must be at least 1']
  },
  duration: {
    type: Number, // in minutes
    default: 0,
    min: [0, 'Duration cannot be negative']
  },
  // Content details
  videoUrl: String,
  videoProvider: {
    type: String,
    enum: ['youtube', 'vimeo', 'wistia', 'local', 'aws-s3'],
    default: 'local'
  },
  videoDuration: Number, // in seconds for video lessons
  videoThumbnail: String,
  transcript: String,
  // Resources and attachments
  resources: [resourceSchema],
  // Access control
  isPreview: {
    type: Boolean,
    default: false
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  // References to related content
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz'
  },
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment'
  },
  // Assignment details (embedded)
  assignmentDetails: {
    title: String,
    description: String,
    instructions: String,
    dueDate: Date,
    maxScore: {
      type: Number,
      default: 100
    },
    submissionType: {
      type: String,
      enum: ['text', 'file', 'url', 'code'],
      default: 'text'
    },
    maxFileSize: Number, // in MB
    allowedFileTypes: [String],
    maxFiles: {
      type: Number,
      default: 1
    }
  },
  completionCriteria: {
    type: String,
    enum: ['view', 'quiz_pass', 'assignment_submit', 'time_spent'],
    default: 'view'
  },
  minTimeToComplete: {
    type: Number,
    default: 0 // in seconds
  },
  // Settings
  settings: {
    allowComments: {
      type: Boolean,
      default: true
    },
    downloadable: {
      type: Boolean,
      default: false
    },
    autoComplete: {
      type: Boolean,
      default: false
    },
    preventSkipping: {
      type: Boolean,
      default: false
    },
    showTranscript: {
      type: Boolean,
      default: false
    }
  },
  // Analytics
  views: {
    type: Number,
    default: 0
  },
  completions: {
    type: Number,
    default: 0
  },
  averageTimeSpent: {
    type: Number, // in seconds
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  // Metadata
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  language: {
    type: String,
    default: 'en'
  },
  thumbnail: String
}, {
  timestamps: true,
  _id: true
});

const chapterSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Chapter title is required']
  },
  description: String,
  order: {
    type: Number,
    required: true
  },
  lessons: [lessonSchema],
  isPublished: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const enrollmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  enrolledAt: {
    type: Date,
    default: Date.now
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  completedLessons: [{
    lessonId: mongoose.Schema.Types.ObjectId,
    completedAt: Date
  }],
  currentLesson: mongoose.Schema.Types.ObjectId,
  certificateIssued: {
    type: Boolean,
    default: false
  },
  certificateUrl: String,
  finalGrade: {
    type: Number,
    min: 0,
    max: 100
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'dropped', 'expired'],
    default: 'active'
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now
  }
});

const reviewSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    maxlength: 1000
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true,
    maxlength: [200, 'Course title cannot exceed 200 characters']
  },
  slug: {
    type: String,
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Course description is required'],
    maxlength: [5000, 'Course description cannot exceed 5000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [500, 'Short description cannot exceed 500 characters']
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Course must have an instructor']
  },
  coInstructors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  category: {
    type: String,
    required: [true, 'Course category is required'],
    validate: {
      validator: async function(value) {
        // Check if category exists in Category collection
        const Category = mongoose.model('Category');
        const category = await Category.findOne({
          name: value,
          isActive: true
        });
        return !!category;
      },
      message: 'Category must be a valid active category from the system'
    }
  },
  subcategory: String,
  level: {
    type: String,
    required: [true, 'Course level is required'],
    enum: ['beginner', 'intermediate', 'advanced', 'expert']
  },
  language: {
    type: String,
    required: [true, 'Course language is required'],
    default: 'English'
  },
  subtitles: [{
    language: String,
    url: String
  }],
  price: {
    type: Number,
    required: [true, 'Course price is required'],
    min: 0
  },
  originalPrice: Number,
  discountPrice: Number,
  currency: {
    type: String,
    default: 'USD'
  },
  duration: {
    type: Number,
    default: 0 // in minutes
  },
  thumbnail: String,
  previewVideo: String,
  images: [String],
  chapters: [chapterSchema],
  tags: [{
    type: String,
    trim: true
  }],
  prerequisites: [String],
  learningObjectives: [String],
  learningOutcomes: [String],
  targetAudience: [String],
  requirements: [String],
  estimatedDuration: {
    type: Number,
    default: 0 // in hours
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  publishedAt: Date,
  enrollments: [enrollmentSchema],
  reviews: [reviewSchema],
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    },
    distribution: {
      1: { type: Number, default: 0 },
      2: { type: Number, default: 0 },
      3: { type: Number, default: 0 },
      4: { type: Number, default: 0 },
      5: { type: Number, default: 0 }
    }
  },
  stats: {
    totalEnrollments: {
      type: Number,
      default: 0
    },
    totalCompletions: {
      type: Number,
      default: 0
    },
    totalRevenue: {
      type: Number,
      default: 0
    },
    averageCompletionTime: {
      type: Number,
      default: 0
    },
    completionRate: {
      type: Number,
      default: 0
    }
  },
  settings: {
    allowComments: {
      type: Boolean,
      default: true
    },
    allowReviews: {
      type: Boolean,
      default: true
    },
    autoApproveComments: {
      type: Boolean,
      default: false
    },
    certificateEnabled: {
      type: Boolean,
      default: true
    },
    passRequirement: {
      type: Number,
      default: 70 // percentage
    },
    maxEnrollments: Number,
    enrollmentDeadline: Date,
    courseStartDate: Date,
    courseEndDate: Date
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
courseSchema.index({ title: 'text', description: 'text' });
courseSchema.index({ category: 1 });
courseSchema.index({ level: 1 });
courseSchema.index({ instructor: 1 });
courseSchema.index({ isPublished: 1 });
courseSchema.index({ isFeatured: 1 });
courseSchema.index({ 'rating.average': -1 });
courseSchema.index({ 'stats.totalEnrollments': -1 });
courseSchema.index({ createdAt: -1 });
courseSchema.index({ price: 1 });

// Virtual for enrollment count
courseSchema.virtual('enrollmentCount').get(function () {
  return this.enrollments ? this.enrollments.length : 0;
});

// Virtual for lesson count
courseSchema.virtual('lessonCount').get(function () {
  if (!this.chapters) return 0;
  return this.chapters.reduce((total, chapter) => {
    return total + (chapter.lessons ? chapter.lessons.length : 0);
  }, 0);
});

// Virtual for total duration
courseSchema.virtual('totalDuration').get(function () {
  if (!this.chapters) return 0;
  return this.chapters.reduce((total, chapter) => {
    return total + chapter.lessons.reduce((chapterTotal, lesson) => {
      return chapterTotal + (lesson.duration || 0);
    }, 0);
  }, 0);
});

// Pre-save middleware to generate slug
courseSchema.pre('save', function (next) {
  if (this.isModified('title') || this.isNew) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .replace(/\s+/g, '-');

    // Ensure slug is unique by appending timestamp if needed
    if (this.isNew) {
      this.slug += '-' + Date.now();
    }
  }
  next();
});

// Pre-save middleware to update stats
courseSchema.pre('save', function (next) {
  if (this.enrollments) {
    this.stats.totalEnrollments = this.enrollments.length;
    this.stats.totalCompletions = this.enrollments.filter(e => e.status === 'completed').length;
    this.stats.completionRate = this.stats.totalEnrollments > 0
      ? (this.stats.totalCompletions / this.stats.totalEnrollments) * 100
      : 0;
  }

  if (this.reviews && this.reviews.length > 0) {
    const approvedReviews = this.reviews.filter(r => r.isApproved);
    this.rating.count = approvedReviews.length;

    if (approvedReviews.length > 0) {
      const totalRating = approvedReviews.reduce((sum, review) => sum + review.rating, 0);
      this.rating.average = totalRating / approvedReviews.length;

      // Update distribution
      this.rating.distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      approvedReviews.forEach(review => {
        this.rating.distribution[review.rating]++;
      });
    }
  }

  next();
});

// Static method to find published courses
courseSchema.statics.findPublished = function () {
  return this.find({
    isPublished: true,
    isApproved: true,
    isDeleted: false
  });
};

// Static method to find courses by category
courseSchema.statics.findByCategory = function (category) {
  return this.find({
    category,
    isPublished: true,
    isApproved: true,
    isDeleted: false
  });
};

// Static method to find featured courses
courseSchema.statics.findFeatured = function () {
  return this.find({
    isFeatured: true,
    isPublished: true,
    isApproved: true,
    isDeleted: false
  });
};

// Instance method to enroll student
courseSchema.methods.enrollStudent = function (studentId) {
  const existingEnrollment = this.enrollments.find(
    enrollment => enrollment.student.toString() === studentId.toString()
  );

  if (existingEnrollment) {
    throw new Error('Student is already enrolled in this course');
  }

  this.enrollments.push({
    student: studentId,
    enrolledAt: new Date()
  });

  return this.save();
};

// Instance method to update student progress
courseSchema.methods.updateProgress = function (studentId, lessonId) {
  const enrollment = this.enrollments.find(
    e => e.student.toString() === studentId.toString()
  );

  if (!enrollment) {
    throw new Error('Student is not enrolled in this course');
  }

  // Check if lesson is already completed
  const existingCompletion = enrollment.completedLessons.find(
    cl => cl.lessonId.toString() === lessonId.toString()
  );

  if (!existingCompletion) {
    enrollment.completedLessons.push({
      lessonId,
      completedAt: new Date()
    });
  }

  // Update progress percentage
  const totalLessons = this.lessonCount;
  if (totalLessons > 0) {
    enrollment.progress = (enrollment.completedLessons.length / totalLessons) * 100;
  }

  // Update current lesson
  enrollment.currentLesson = lessonId;
  enrollment.lastAccessedAt = new Date();

  // Mark as completed if 100%
  if (enrollment.progress >= 100) {
    enrollment.status = 'completed';
  }

  return this.save();
};

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;