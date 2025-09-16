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
  type: 'pdf' | 'video' | 'image' | 'document' | 'link' | 'other';
  size?: number;
  downloadable?: boolean;
  uploadedAt: string;
}

export interface CourseAssignment {
  title?: string;
  description?: string;
  dueDate?: string;
  maxScore: number;
  submissionType: 'text' | 'file' | 'url' | 'code';
}

export interface CourseLesson extends BaseDocument {
  title: string;
  description?: string;
  content: string;
  type: 'video' | 'text' | 'quiz' | 'assignment' | 'interactive';
  duration: number; // in minutes
  videoUrl?: string;
  videoThumbnail?: string;
  order: number;
  isPreview: boolean;
  resources: CourseResource[];
  quiz?: string; // Quiz ObjectId
  assignment?: CourseAssignment;
  completionCriteria: 'view' | 'quiz_pass' | 'assignment_submit' | 'time_spent';
  minTimeToComplete: number; // in seconds
  isPublished: boolean;
}

export interface CourseChapter extends BaseDocument {
  title: string;
  description?: string;
  order: number;
  lessons: CourseLesson[];
  isPublished: boolean;
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
}

export interface Course extends BaseDocument {
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  instructor: string | User; // User ObjectId or populated User object
  coInstructors: string[]; // User ObjectIds
  category: 'programming' | 'web-development' | 'mobile-development' | 'data-science' |
  'machine-learning' | 'artificial-intelligence' | 'cybersecurity' | 'cloud-computing' |
  'devops' | 'blockchain' | 'game-development' | 'ui-ux-design' | 'digital-marketing' |
  'business' | 'finance' | 'management' | 'personal-development' | 'health-fitness' |
  'language-learning' | 'arts-crafts' | 'music' | 'photography' | 'other';
  subcategory?: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
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
  targetAudience: string[];
  requirements: string[];
  whatYouWillLearn: string[];
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
  course: string; // Course ObjectId
  section?: string; // Section ObjectId
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
  slug: string;
  description?: string;
  logo?: string;
  website?: string;
  contactEmail?: string;
  phone?: string;
  address?: UserAddress;
  settings: {
    allowUserRegistration: boolean;
    requireEmailVerification: boolean;
    enableSSO: boolean;
  };
  subscription?: UserSubscription;
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
  author: author; // User ObjectId
  isPublished: boolean;
  publishedAt?: string;
  views: number;
  likes: number;
  organization?: string; // Organization ObjectId
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