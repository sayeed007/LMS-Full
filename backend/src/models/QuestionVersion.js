const mongoose = require('mongoose');

/**
 * QuestionVersion Model
 *
 * Tracks complete revision history of questions
 * Stores snapshots of question data at each save point
 * Enables version comparison, diff viewing, and rollback functionality
 */

const questionVersionSchema = new mongoose.Schema({
  // Reference to the question this version belongs to
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: [true, 'Question ID is required'],
    index: true
  },

  // Version number (incremental)
  version: {
    type: Number,
    required: [true, 'Version number is required'],
    min: [1, 'Version must be at least 1']
  },

  // Complete snapshot of question data at this version
  data: {
    text: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['single-choice', 'multiple-choice', 'descriptive', 'true-false', 'fill-blank'],
      required: true
    },
    choices: [{
      text: String,
      isCorrect: Boolean
    }],
    correctAnswer: String,
    explanation: String,
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard']
    },
    points: Number,
    timeLimit: Number,
    tags: [String],
    attachments: [{
      name: String,
      url: String,
      type: String
    }]
  },

  // Optional description of what changed in this version
  changeDescription: {
    type: String,
    trim: true,
    maxlength: [500, 'Change description cannot exceed 500 characters']
  },

  // Fields that were modified in this version (for quick reference)
  modifiedFields: [{
    type: String,
    enum: [
      'text', 'type', 'choices', 'correctAnswer', 'explanation',
      'difficulty', 'points', 'timeLimit', 'tags', 'attachments'
    ]
  }],

  // User who created this version
  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Version creator is required']
  },

  // Metadata
  isAutoSaved: {
    type: Boolean,
    default: false // True for auto-saves, false for manual saves
  },

  // Size tracking (for monitoring storage usage)
  dataSize: {
    type: Number,
    default: 0 // Size in bytes
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound index for efficient querying
questionVersionSchema.index({ questionId: 1, version: -1 });
questionVersionSchema.index({ questionId: 1, createdAt: -1 });
questionVersionSchema.index({ changedBy: 1 });

// Virtual for user-friendly version label
questionVersionSchema.virtual('versionLabel').get(function() {
  return `v${this.version}`;
});

// Pre-save middleware to calculate data size
questionVersionSchema.pre('save', function(next) {
  if (this.data) {
    // Calculate approximate size in bytes
    this.dataSize = JSON.stringify(this.data).length;
  }
  next();
});

// Static method: Get all versions for a question
questionVersionSchema.statics.findByQuestion = function(questionId, options = {}) {
  const { limit = 50, skip = 0, sort = { version: -1 } } = options;

  return this.find({ questionId })
    .populate('changedBy', 'name email avatar')
    .sort(sort)
    .limit(limit)
    .skip(skip);
};

// Static method: Get latest version for a question
questionVersionSchema.statics.findLatestVersion = function(questionId) {
  return this.findOne({ questionId })
    .sort({ version: -1 })
    .populate('changedBy', 'name email avatar');
};

// Static method: Get specific version
questionVersionSchema.statics.findByVersion = function(questionId, versionNumber) {
  return this.findOne({ questionId, version: versionNumber })
    .populate('changedBy', 'name email avatar');
};

// Static method: Get version count for a question
questionVersionSchema.statics.countVersions = function(questionId) {
  return this.countDocuments({ questionId });
};

// Static method: Create new version from question data
questionVersionSchema.statics.createVersion = async function(questionId, questionData, userId, changeDescription = null) {
  // Get the latest version number
  const latestVersion = await this.findOne({ questionId }).sort({ version: -1 });
  const newVersionNumber = latestVersion ? latestVersion.version + 1 : 1;

  // Detect modified fields by comparing with previous version
  let modifiedFields = [];
  if (latestVersion) {
    modifiedFields = this.detectChanges(latestVersion.data, questionData);
  } else {
    // First version - all fields are "new"
    modifiedFields = Object.keys(questionData);
  }

  // Create the version document
  const version = new this({
    questionId,
    version: newVersionNumber,
    data: questionData,
    changeDescription,
    modifiedFields,
    changedBy: userId
  });

  await version.save();
  return version;
};

// Static method: Detect which fields changed between versions
questionVersionSchema.statics.detectChanges = function(oldData, newData) {
  const changes = [];

  // Compare each field
  const fields = ['text', 'type', 'explanation', 'difficulty', 'points', 'timeLimit'];

  fields.forEach(field => {
    if (oldData[field] !== newData[field]) {
      changes.push(field);
    }
  });

  // Special handling for arrays and objects
  if (JSON.stringify(oldData.choices) !== JSON.stringify(newData.choices)) {
    changes.push('choices');
  }
  if (JSON.stringify(oldData.tags) !== JSON.stringify(newData.tags)) {
    changes.push('tags');
  }
  if (JSON.stringify(oldData.attachments) !== JSON.stringify(newData.attachments)) {
    changes.push('attachments');
  }

  return changes;
};

// Static method: Cleanup old versions (retention policy)
questionVersionSchema.statics.cleanupOldVersions = async function(questionId, keepCount = 50) {
  // Keep only the most recent 'keepCount' versions
  const versions = await this.find({ questionId })
    .sort({ version: -1 })
    .select('_id')
    .skip(keepCount);

  if (versions.length > 0) {
    const idsToDelete = versions.map(v => v._id);
    await this.deleteMany({ _id: { $in: idsToDelete } });
    return idsToDelete.length;
  }

  return 0;
};

// Instance method: Compare this version with another
questionVersionSchema.methods.compareWith = function(otherVersion) {
  const changes = {
    added: [],
    modified: [],
    removed: []
  };

  const thisData = this.data;
  const otherData = otherVersion.data;

  // Simple field comparison
  const fields = ['text', 'type', 'explanation', 'difficulty', 'points', 'timeLimit'];

  fields.forEach(field => {
    if (thisData[field] !== otherData[field]) {
      changes.modified.push({
        field,
        oldValue: otherData[field],
        newValue: thisData[field]
      });
    }
  });

  // Compare choices
  if (JSON.stringify(thisData.choices) !== JSON.stringify(otherData.choices)) {
    changes.modified.push({
      field: 'choices',
      oldValue: otherData.choices,
      newValue: thisData.choices
    });
  }

  return changes;
};

// Instance method: Restore this version to the question
questionVersionSchema.methods.restoreToQuestion = async function() {
  const Question = mongoose.model('Question');
  const question = await Question.findById(this.questionId);

  if (!question) {
    throw new Error('Question not found');
  }

  // Update question with this version's data
  Object.assign(question, this.data);

  // Save the question (this will create a new version)
  await question.save();

  return question;
};

const QuestionVersion = mongoose.model('QuestionVersion', questionVersionSchema);

module.exports = QuestionVersion;
