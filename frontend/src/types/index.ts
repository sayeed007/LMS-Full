// Re-export backend model types for convenience
export * from './backend-models';

// Legacy/UI-specific types for compatibility (these might be used in existing components)
export interface Learner {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  coursesEnrolled: number;
  yetToStart: number;
  inProgress: number;
  completed: number;
  completionPercentage: number;
}

export interface LegacyCourse {
  id: number;
  name: string;
  enrollDate: string;
  completedDate: string;
  timeSpent: string;
  completionPercentage: number;
  status: 'In Progress' | 'Complete' | 'Yet to Start';
}

export interface CourseDetails {
  id?: string;
  name: string;
  category: string;
  description: string;
  difficulty: string;
  chapters: number;
  lessons: number;
  quizzes: number;
  image: string;
}

export interface LegacyLesson {
  id: number;
  lesson: string;
  startDate: string;
  timeSpent: string;
  completionPercentage: number;
  status: 'Complete' | 'In Progress' | 'Yet to Start';
}

export interface SummaryStats {
  totalLearner: number;
  courseEnrolled: number;
  yetToStart: number;
  inProgress: number;
  completed: number;
}

export interface LearnerStats {
  courseEnrolled: number;
  yetToStart: number;
  inProgress: number;
  completed: number;
}


export interface CourseSummary {
  id: number
  name: string
  totalLearners: number
  yetToStart: number
  inProgress: number
  completed: number
}

export interface ReportStats {
  total: number
  published: number
  unpublished: number
}



// Define the Article interface to match the merged structure
export interface Author {
  name?: string;
  avatar?: string;
  initials: string;
}

export interface Comment {
  id: number;
  author: Author;
  date: string;
  time: string;
  content: string;
}

export interface Article {
  id: string;
  title: string;
  category: string;
  author: Author;
  publishDate: string;
  publishTime: string;
  views: number;
  thumbnail: string;
  myArticle: boolean;
  isPublished: boolean;
  content: string;
  votes: {
    yes: number;
    no: number;
  };
  comments: Comment[];
}


// Legacy question types for quiz/test UI components
export interface LegacyQuestionChoice {
  id: string
  text: string
  isCorrect: boolean
}

export interface LegacyQuestion {
  id: string
  type: 'single-choice' | 'multiple-choice' | 'descriptive' | 'question-bank'
  text: string
  choices: LegacyQuestionChoice[]
  score: number
  timeLimit: number
  required: boolean
}

export interface LegacySection {
  id: string
  title: string
  description?: string
  questions: LegacyQuestion[]
}

export interface CourseDummyData {
  id: string;
  title: string;
  description: string;
  sections: LegacySection[];
}
