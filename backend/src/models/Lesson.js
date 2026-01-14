const mongoose = require('mongoose');

// Schema for content blocks (Text, Image, Video, etc.)
const blockSchema = new mongoose.Schema({
  id: String, // Frontend generated ID
  type: {
    type: String,
    enum: ['text', 'image', 'video', 'audio', 'document', 'code'],
    required: true
  },
  title: String,
  order: Number,
  // Flexible data object for block content
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, { _id: false });

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Lesson title is required'],
    trim: true,
    maxlength: [200, 'Lesson title cannot exceed 200 characters']
  },
  description: String,
  type: {
    type: String,
    enum: ['text', 'video', 'quiz', 'assignment', 'live', 'document', 'block'],
    default: 'text',
    required: true
  },
  // Hierarchy
  module: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
    // required: [true, 'Lesson must belong to a module'] // Temporarily optional for migration
  },
  chapter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chapter'
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Lesson must belong to a course']
  },
  order: {
    type: Number,
    required: true,
    default: 0
  },
  
  // Content storage
  content: String, // For simple text content
  blocks: [blockSchema], // For modular content
  
  // Specific media fields (for backward compatibility/simple types)
  videoUrl: String,
  duration: {
    type: Number, // minutes
    default: 0
  },
  
  // References
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz'
  },
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment'
  },
  
  // Legacy Resources (keeping for backward compatibility)
  resources: [{
    title: String,
    url: String,
    type: String
  }],
  
  // Settings
  isPublished: {
    type: Boolean,
    default: false
  },
  isPreview: {
    type: Boolean,
    default: false
  },
  settings: {
    allowComments: { type: Boolean, default: true },
    isDownloadable: { type: Boolean, default: false }
  },
  
  // Stats
  views: { type: Number, default: 0 },
  completions: { type: Number, default: 0 },
  
  isDeleted: {
    type: Boolean,
    default: false
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
lessonSchema.index({ module: 1, order: 1 });
lessonSchema.index({ course: 1 });

// Static methods
lessonSchema.statics.getNextOrder = async function (courseId) {
  const lastLesson = await this.findOne({
    course: courseId,
    isDeleted: false
  }).sort({ order: -1 });

  return lastLesson ? lastLesson.order + 1 : 1;
};

const Lesson = mongoose.model('Lesson', lessonSchema);

module.exports = Lesson;