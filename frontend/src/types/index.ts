// Type definitions for the data structures
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

export interface Course {
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


// If you want to be more specific about difficulty levels:
export interface CourseWithSpecificDifficulty {
    id: string;
    name: string;
    category: string;
    description: string;
    difficulty: "Beginner" | "Intermediate" | "Advanced";
    chapters: number;
    lessons: number;
    quizzes: number;
    image: string;
}

// If you want to make some fields optional:
export interface OptionalCourse {
    id: string;
    name: string;
    category: string;
    description: string;
    difficulty: string;
    chapters: number;
    lessons: number;
    quizzes?: number; // Optional
    image?: string;   // Optional
}

export interface Lesson {
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
  name: string;
  avatar: string;
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


// types/index.ts
export interface QuestionChoice {
  id: string
  text: string
  isCorrect: boolean
}

export interface Question {
  id: string
  type: 'single-choice' | 'multiple-choice' | 'descriptive' | 'question-bank'
  text: string
  choices: QuestionChoice[]
  score: number
  timeLimit: number
  required: boolean
}

export interface Section {
  id: string
  title: string
  description?: string
  questions: Question[]
}


export interface CourseDummyData {
  id: string;
  title: string;
  description: string;
  sections: Section[];
}