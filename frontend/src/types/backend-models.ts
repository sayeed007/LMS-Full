// =============================================================================
// Backend Model Types - Generated from backend/src/models
// =============================================================================

// Base MongoDB document interface
export interface BaseDocument {
  _id: string;
  createdAt: string;
  updatedAt: string;
}

// =============================================================================
// User Model Types (from User.js)
// =============================================================================

export interface UserSubscription {
  plan: 'free' | 'basic' | 'premium' | 'enterprise';
  status: 'active' | 'inactive' | 'cancelled' | 'expired';
  startDate: string;
  expiresAt?: string;
  features: {
    maxCourses: number;
    maxStudents: number;
    maxStorage: number; // MB
    analyticsAccess: boolean;
    customBranding: boolean;
    prioritySupport: boolean;
  };
}

export interface UserLearningProgress {
  courseId: string;
  enrolledAt: string;
  completedLessons: Array<{
    lessonId: string;
    completedAt: string;
    timeSpent: number;
  }>;
  currentLesson?: string;
  progressPercentage: number;
  totalTimeSpent: number;
  lastAccessedAt: string;
  certificateIssued: boolean;
  certificateUrl?: string;
  grade?: number;
  status: 'enrolled' | 'in-progress' | 'completed' | 'dropped';
}

export interface UserAddress {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
}

export interface UserSocialLinks {
  linkedin?: string;
  twitter?: string;
  website?: string;
  github?: string;
}

export interface UserPreferences {
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  theme: 'light' | 'dark' | 'auto';
}

export interface UserRefreshToken {
  token: string;
  createdAt: string;
  expiresAt: string;
  userAgent?: string;
  ipAddress?: string;
}

export interface User extends BaseDocument {
  name: string;
  email: string;
  password?: string;
  role: 'student' | 'instructor' | 'org_admin' | 'super_admin';
  avatar?: string;
  bio?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  address?: UserAddress;
  socialLinks?: UserSocialLinks;
  skills: string[];
  interests: string[];
  isActive: boolean;
  emailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: string;
  passwordResetToken?: string;
  passwordResetExpires?: string;
  lastLogin?: string;
  loginAttempts: number;
  lockUntil?: string;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  refreshTokens: UserRefreshToken[];
  organization?: string;
  subscription?: UserSubscription;
  learningProgress: UserLearningProgress[];
  preferences: UserPreferences;
  // OAuth fields
  googleId?: string;
  microsoftId?: string;
  linkedinId?: string;
  oauthProviders: Map<string, { id: string; email: string }>;
  // Activity tracking
  lastActiveAt: string;
  totalCourseCompletions: number;
  totalTimeSpent: number;
  // Virtual fields
  isLocked?: boolean;
}

// =============================================================================
// Course Model Types (from Course.js)
// =============================================================================

export interface CourseResource {
  title: string;
  url: string;
  type: 'pdf' | 'video' | 'link' | 'document' | 'image' | 'audio';
  size?: number; // in bytes
  duration?: number; // for video/audio resources in seconds
  downloadable: boolean;
  uploadedAt: string;
}

export interface CourseAssignmentDetails {
  title?: string;
  description?: string;
  instructions?: string;
  dueDate?: string;
  maxScore: number;
  submissionType: 'text' | 'file' | 'url' | 'code';
  maxFileSize?: number; // in MB
  allowedFileTypes?: string[];
  maxFiles: number;
}

export interface CourseLessonSettings {
  allowComments: boolean;
  isDownloadable: boolean;
  autoComplete: boolean;
  preventSkipping: boolean;
  showTranscript: boolean;
}

// =============================================================================
// Content Model Types (from Content.js) - New Hierarchical Structure
// =============================================================================

// Block Item Schema - for block content type
export interface ContentBlockItem {
  _id?: string;
  type: 'text' | 'image' | 'audio' | 'video' | 'document';
  order: number;
  data: {
    // Text content
    text?: string;
    // Media content (image, audio, video, document)
    url?: string;
    filename?: string;
    size?: number;
    mimeType?: string;
    // Common metadata
    title?: string;
    description?: string;
    alt?: string; // for images
    duration?: number; // for audio/video in seconds
    // Additional properties can be added as needed
    metadata?: Record<string, unknown>;
  };
  createdAt: string;
  updatedAt: string;
}

// Quiz Question Choice
export interface ContentQuizChoice {
  text: string;
  isCorrect: boolean;
  explanation?: string;
}

// Quiz Question Schema
export interface ContentQuizQuestion {
  _id?: string;
  type: 'single_choice' | 'multiple_choice' | 'descriptive' | 'pick_from_db';
  order: number;
  question: string;
  // For choice-based questions
  options?: ContentQuizChoice[];
  // For descriptive questions
  expectedAnswer?: string;
  maxLength?: number;
  // For pick_from_db questions
  dbCollectionRef?: string;
  dbQuery?: Record<string, unknown>;
  // Common question properties
  points: number;
  explanation?: string;
  hint?: string;
  timeLimit?: number; // in seconds
  isRequired: boolean;
  createdAt: string;
  updatedAt: string;
}

// Assignment Schema
export interface ContentAssignment {
  title: string;
  description: string;
  instructions?: string;
  // Submission settings
  submissionType: 'file' | 'text' | 'url' | 'mixed';
  maxFileSize: number; // in bytes
  allowedFileTypes?: string[];
  maxSubmissions: number;
  // Grading
  maxPoints: number;
  gradingRubric?: string;
  autoGrade: boolean;
  // Deadlines
  dueDate?: string;
  availableFrom?: string;
  availableUntil?: string;
  // Late submission settings
  allowLateSubmission: boolean;
  lateSubmissionPenalty: number; // percentage
  createdAt: string;
  updatedAt: string;
}

// Main Content Interface
export interface LessonContent extends BaseDocument {
  // Basic info
  title: string;
  description?: string;
  // Content type and data
  type: 'text' | 'block' | 'audio' | 'video' | 'document' | 'quiz' | 'assignment';
  // Content-specific data based on type
  data: {
    // For text content
    text?: string;
    title?: string;
    // For media content (audio, video, document)
    url?: string;
    filename?: string;
    size?: number;
    mimeType?: string;
    duration?: number; // for audio/video
    // For block content - array of block items
    items?: ContentBlockItem[];
    // For quiz content
    quiz?: {
      instructions?: string;
      timeLimit?: number; // in seconds
      attempts: number;
      shuffleQuestions: boolean;
      showFeedback: boolean;
      passingScore: number; // 0-100
      questions: ContentQuizQuestion[];
    };
    // For assignment content
    assignment?: ContentAssignment;
  };
  // Relationships
  lesson: string; // Lesson ObjectId
  // Ordering within lesson
  order: number;
  // Access control
  isPublished: boolean;
  isPreview: boolean;
  // Creator info
  createdBy: string; // User ObjectId
  // Status tracking
  isActive: boolean;
  isDeleted: boolean;
  deletedAt?: string;
  lastModified: string;
  // Engagement metrics
  views: number;
  avgCompletionTime?: number; // in seconds
  // Learning objectives
  objectives?: string[];
  tags?: string[];
}

// Updated lesson interface to match new backend structure
export interface CourseLesson extends BaseDocument {
  title: string;
  description?: string;
  type?: 'text' | 'video' | 'quiz' | 'assignment' | 'live' | 'document' | 'block';
  course: string; // Course ObjectId
  chapter?: string; // Chapter ObjectId - NEW: for chapter-based structure
  module?: string; // Module ObjectId - for backward compatibility
  order: number;
  estimatedDuration?: number; // in minutes - estimated total time for all content in lesson
  duration?: number; // Alias for estimatedDuration
  // Resources and attachments (keeping for backward compatibility)
  resources?: CourseResource[];
  // Access control
  isPreview?: boolean;
  isPublished?: boolean;
  isPremium?: boolean;
  isDeleted?: boolean;
  deletedAt?: string;
  // Settings
  settings?: CourseLessonSettings;
  // Creator info
  createdBy?: string; // User ObjectId
  // Analytics and engagement
  views?: number;
  completions?: number;
  averageTimeSpent?: number; // in seconds
  likes?: number;
  // Metadata
  tags?: string[];
  language?: string;
  thumbnail?: string;
  // Status tracking
  isActive?: boolean;
  lastModified?: string;
  // Virtual fields
  completionRate?: number;
  resourceCount?: number;
  contentCount?: number;
  formattedDuration?: string;
  // Content relationship (virtual population)
  content?: LessonContent[];
  // Assignment and quiz references
  assignment?: string;
  assignmentDetails?: CourseAssignmentDetails;
  quiz?: string;
}

export interface CourseChapter extends BaseDocument {
  title: string;
  description?: string;
  course: string; // Course ObjectId
  order: number;
  lessons?: CourseLesson[]; // Virtual field populated from Lesson.chapter
  isPublished?: boolean;
  isActive?: boolean;
  isDeleted?: boolean;
  deletedAt?: string;
  createdBy?: string; // User ObjectId
  lastModified?: string;
  // Virtual field
  lessonCount?: number;
}

export interface CourseEnrollment {
  student: string; // User ObjectId
  enrolledAt: string;
  progress: number;
  completedLessons: Array<{
    lessonId: string;
    completedAt: string;
  }>;
  currentLesson?: string;
  certificateIssued: boolean;
  certificateUrl?: string;
  finalGrade?: number;
  status: 'active' | 'completed' | 'dropped' | 'expired';
  lastAccessedAt: string;
}

export interface CourseReview {
  student: string; // User ObjectId
  rating: number; // 1-5
  comment?: string;
  isApproved: boolean;
  createdAt: string;
}

export interface CourseSubtitle {
  language: string;
  url: string;
}

export interface CourseRating {
  average: number;
  count: number;
  distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface CourseStats {
  totalEnrollments: number;
  totalCompletions: number;
  totalRevenue: number;
  averageCompletionTime: number;
  completionRate: number;
  totalQuizzes?: number;
}

export interface CourseSettings {
  allowComments: boolean;
  allowReviews: boolean;
  autoApproveComments: boolean;
  certificateEnabled: boolean;
  passRequirement: number; // percentage
  maxEnrollments?: number;
  enrollmentDeadline?: string;
  courseStartDate?: string;
  courseEndDate?: string;
  expiration?: {
    type: 'from_enrollment' | 'from_publish' | 'never';
    days: number;
  };
  visibility?: 'public' | 'organization' | 'private';
  reminders?: {
    name: string;
    type: string;
    via: string;
    active: boolean;
    message?: string;
  }[];
  certificate?: {
    enabled: boolean;
    templateId?: string;
  };
}

export interface Course extends BaseDocument {
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  instructor: string | User; // User ObjectId or populated User object
  coInstructors: string[]; // User ObjectIds
  category: string; // Dynamic category from Category collection
  subcategory?: string;
  level: 'Beginner' | 'Intermediate' | 'Expert' | 'All Levels';
  language: string;
  subtitles: CourseSubtitle[];
  price: number;
  originalPrice?: number;
  discountPrice?: number;
  currency: string;
  duration: number; // in minutes
  thumbnail?: string;
  previewVideo?: string;
  images: string[];
  chapters: CourseChapter[];
  tags: string[];
  prerequisites: string[];
  learningObjectives: string[];
  learningOutcomes: string[];
  targetAudience: string[];
  requirements: string[];
  estimatedDuration: number; // in minutes
  isPublished: boolean;
  isFeatured: boolean;
  isApproved: boolean;
  approvedBy?: string; // User ObjectId
  approvedAt?: string;
  publishedAt?: string;
  enrollments: CourseEnrollment[];
  reviews: CourseReview[];
  rating: CourseRating;
  stats: CourseStats;
  settings: CourseSettings;
  organization?: string; // Organization ObjectId
  createdBy: string | User; // User ObjectId or populated User object
  lastUpdatedBy?: string; // User ObjectId
  isDeleted: boolean;
  deletedAt?: string;
  deletedBy?: string; // User ObjectId
  // Virtual fields
  enrollmentCount?: number;
  lessonCount?: number;
  totalDuration?: number;
}

// =============================================================================
// Question Model Types (from Question.js)
// =============================================================================

export interface QuestionChoice {
  _id?: string;
  text: string;
  isCorrect: boolean;
}

export interface QuestionAttachment {
  name: string;
  url: string;
  type: 'image' | 'video' | 'audio' | 'document';
}

export interface Question extends BaseDocument {
  text: string;
  type: 'single-choice' | 'multiple-choice' | 'descriptive' | 'true-false' | 'fill-blank';
  choices: QuestionChoice[];
  correctAnswer?: string;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  timeLimit: number; // in seconds
  tags: string[];
  attachments: QuestionAttachment[];
  // References
  questionBank: string; // QuestionBank ObjectId
  bankSection?: string; // Internal section within the QuestionBank
  order?: number; // Custom sequencing
  createdBy: string; // User ObjectId
  organization?: string; // Organization ObjectId
  // Status
  isActive: boolean;
  isPublic: boolean;
  // Analytics
  timesUsed: number;
  averageScore: number;
  lastUsed?: string;
  // Virtual fields
  correctChoicesCount?: number;
}

// =============================================================================
// Additional Model Types (from other models)
// =============================================================================

export interface Organization extends BaseDocument {
  name: string;
  email: string;
  type: 'educational_institution' | 'corporate' | 'government' | 'non_profit' | 'other';
  description?: string;
  logo?: string;
  website?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  contactPerson?: {
    name?: string;
    email?: string;
    phone?: string;
    position?: string;
  };
  settings: {
    allowPublicCourses: boolean;
    requireApproval: boolean;
    customBranding: boolean;
  };
  isActive: boolean;
}

export interface QuestionBank extends BaseDocument {
  name: string;
  description?: string;
  course: string; // Course ObjectId
  organization?: string; // Organization ObjectId
  createdBy: string; // User ObjectId
  isActive: boolean;
  isPublic: boolean;
  settings?: {
    passingScoreRequired?: boolean;
    passingScore?: number;
    defaultTimeLimit?: number; // minutes
    maxAttempts?: number; // 0 for unlimited
    randomizeQuestions?: boolean;
    randomizeChoices?: boolean;
    defaultPointsPerQuestion?: number;
    allowRetakes?: boolean;
    showCorrectAnswers?: boolean;
    showExplanations?: boolean;
    showScoreImmediately?: boolean;
  };
}

export interface Quiz extends BaseDocument {
  title: string;
  description?: string;
  instructions?: string;
  course: string; // Course ObjectId
  lesson?: string; // Lesson ObjectId
  questions: string[]; // Question ObjectIds
  timeLimit?: number; // in minutes
  passingScore: number; // percentage
  maxAttempts: number;
  showResults: boolean;
  showCorrectAnswers: boolean;
  randomizeQuestions: boolean;
  isActive: boolean;
  settings: {
    allowReview: boolean;
    showScoreImmediately: boolean;
    allowRetake: boolean;
  };
  createdBy: string; // User ObjectId
}

export interface Enrollment extends BaseDocument {
  student: string; // User ObjectId
  course: string; // Course ObjectId
  enrolledAt: string;
  progress: number;
  completedLessons: Array<{
    lessonId: string;
    completedAt: string;
    timeSpent: number;
  }>;
  currentLesson?: string;
  status: 'active' | 'completed' | 'dropped' | 'expired';
  certificateIssued: boolean;
  certificateUrl?: string;
  finalGrade?: number;
  lastAccessedAt: string;
}

export interface author {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
};
export interface Article extends BaseDocument {
  title: string;
  content: string;
  excerpt?: string;
  slug: string;
  category: string;
  tags: string[];
  thumbnail?: string;
  author: author | null; // User ObjectId - can be null if author is deleted
  status: 'draft' | 'published' | 'archived';
  visibility: 'public' | 'private' | 'organization';
  publishedAt?: string;
  views: number;
  likes: number;
  likedBy?: string[]; // User ObjectIds
  organization?: string; // Organization ObjectId
  // Advanced settings
  allowRating: boolean;
  allowComments: boolean;
  showViews: boolean;
  allowExport: boolean;
  // Deprecated field - use status instead
  isPublished?: boolean;
}

// =============================================================================
// API Response Types
// =============================================================================

export interface ApiResponse<T = unknown> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
  results?: number;
  pagination?: {
    page: number;
    limit: number;
    totalPages: number;
    totalResults: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface ApiError {
  status: 'error';
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}