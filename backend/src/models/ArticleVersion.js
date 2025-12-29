const mongoose = require('mongoose');

const articleVersionSchema = new mongoose.Schema(
  {
    article: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Article',
      required: [true, 'Article reference is required'],
      index: true
    },
    versionNumber: {
      type: Number,
      required: true,
      min: 1
    },
    title: {
      type: String,
      required: [true, 'Title is required']
    },
    content: {
      type: String,
      required: [true, 'Content is required']
    },
    excerpt: {
      type: String,
      maxlength: 500
    },
    category: {
      type: String,
      required: true
    },
    tags: [{
      type: String,
      lowercase: true
    }],
    thumbnail: {
      type: String
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft'
    },
    visibility: {
      type: String,
      enum: ['public', 'private', 'organization'],
      default: 'public'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    changeNote: {
      type: String,
      maxlength: 500
    }
  },
  {
    timestamps: true
  }
);

// Compound index for efficient version queries
articleVersionSchema.index({ article: 1, versionNumber: -1 });
articleVersionSchema.index({ article: 1, createdAt: -1 });

// Static method to get version history for an article
articleVersionSchema.statics.getVersionHistory = function(articleId, limit = 10) {
  return this.find({ article: articleId })
    .sort({ versionNumber: -1 })
    .limit(limit)
    .populate('createdBy', 'name avatar')
    .select('-__v');
};

// Static method to get specific version
articleVersionSchema.statics.getVersion = function(articleId, versionNumber) {
  return this.findOne({ article: articleId, versionNumber });
};

// Static method to create version snapshot
articleVersionSchema.statics.createSnapshot = async function(article, userId, changeNote = null) {
  // Get the latest version number
  const latestVersion = await this.findOne({ article: article._id })
    .sort({ versionNumber: -1 })
    .select('versionNumber');

  const versionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;

  return this.create({
    article: article._id,
    versionNumber,
    title: article.title,
    content: article.content,
    excerpt: article.excerpt,
    category: article.category,
    tags: article.tags,
    thumbnail: article.thumbnail,
    status: article.status,
    visibility: article.visibility,
    createdBy: userId,
    changeNote
  });
};

module.exports = mongoose.model('ArticleVersion', articleVersionSchema);
