import { baseApi, BaseApiResponse } from './baseApi';
import { Quiz as BackendQuiz } from '../../types/backend-models';

// API-specific interface for populated quizzes
export interface QuizPopulated extends BackendQuiz {
  totalAttempts?: number;
  averageScore?: number;
  passRate?: number;
}

// Legacy Quiz interface for backward compatibility
export interface Quiz extends QuizPopulated {}

export interface Question {
  _id: string;
  questionText: string;
  questionType: 'multiple_choice' | 'multiple_select' | 'true_false' | 'short_answer' | 'essay';
  options?: string[];
  correctAnswer?: string | string[];
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  explanation?: string;
}

export interface QuizSettings {
  timeLimit?: number; // in minutes
  maxAttempts: number;
  allowRetakes: boolean;
  passingScore: number;
  gradingMethod: 'highest' | 'latest' | 'average';
  showCorrectAnswers: boolean;
  showExplanations: boolean;
  showScoreImmediately: boolean;
  randomizeQuestions: boolean;
  randomizeChoices: boolean;
  questionsPerPage: number;
  requirePassword: boolean;
  password?: string;
  availableFrom?: string;
  availableUntil?: string;
  enableProctoring: boolean;
  preventCopyPaste: boolean;
  fullScreenRequired: boolean;
}

export interface QuizAttempt {
  _id: string;
  quiz: string;
  user: string;
  answers: QuizAnswer[];
  score: number;
  maxScore: number;
  percentage: number;
  isPassed: boolean;
  timeSpent: number; // in seconds
  startedAt: string;
  submittedAt?: string;
  status: 'in_progress' | 'completed' | 'abandoned';
}

export interface QuizAnswer {
  questionId: string;
  answer: string | string[];
  isCorrect?: boolean;
  pointsAwarded?: number;
}

export interface QuizListParams {
  page?: number;
  limit?: number;
  courseId?: string;
  status?: string;
  search?: string;
  sort?: string;
}

export interface CreateQuizRequest {
  title: string;
  description?: string;
  instructions?: string;
  course: string;
  questions: string[];
  timeLimit?: number;
  passingScore?: number;
  maxAttempts?: number;
  showResults?: boolean;
  showCorrectAnswers?: boolean;
  randomizeQuestions?: boolean;
}

export interface UpdateQuizRequest {
  title?: string;
  description?: string;
  instructions?: string;
  questions?: string[];
  timeLimit?: number;
  passingScore?: number;
  maxAttempts?: number;
  showResults?: boolean;
  showCorrectAnswers?: boolean;
  randomizeQuestions?: boolean;
  isActive?: boolean;
}

export interface StartQuizAttemptResponse {
  attemptId: string;
  quiz: Quiz;
  timeRemaining?: number;
}

export interface SubmitQuizRequest {
  quizId: string;
  attemptId: string;
  answers: Array<{
    questionId: string;
    answer: string | string[];
  }>;
}

export interface SubmitQuizResponse {
  result: {
    score: number;
    maxScore: number;
    percentage: number;
    isPassed: boolean;
    timeSpent: number;
    answers?: QuizAnswer[];
  };
}

export interface QuizResultsResponse {
  stats: {
    totalAttempts: number;
    averageScore: number;
    passRate: number;
    averageTimeSpent: number;
    highestScore: number;
    lowestScore: number;
  };
  attempts: QuizAttempt[];
}

export const quizApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all quizzes with filtering
    getQuizzes: builder.query<BaseApiResponse<QuizPopulated[]>, QuizListParams | void>({
      query: (params = {}) => ({
        url: '/quizzes',
        params,
      }),
      providesTags: ['Quiz'],
    }),

    // Get quiz by ID
    getQuizById: builder.query<BaseApiResponse<{ quiz: QuizPopulated }>, string>({
      query: (id) => `/quizzes/${id}`,
      providesTags: (result, error, id) => [{ type: 'Quiz', id }],
    }),

    // Create new quiz
    createQuiz: builder.mutation<BaseApiResponse<{ quiz: QuizPopulated }>, CreateQuizRequest>({
      query: (data) => ({
        url: '/quizzes',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Quiz'],
    }),

    // Update quiz
    updateQuiz: builder.mutation<BaseApiResponse<{ quiz: QuizPopulated }>, { id: string; data: UpdateQuizRequest }>({
      query: ({ id, data }) => ({
        url: `/quizzes/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Quiz', id }, 'Quiz'],
    }),

    // Delete quiz
    deleteQuiz: builder.mutation<void, string>({
      query: (id) => ({
        url: `/quizzes/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Quiz', id }, 'Quiz'],
    }),

    // Start quiz attempt
    startQuizAttempt: builder.mutation<BaseApiResponse<StartQuizAttemptResponse>, string>({
      query: (quizId) => ({
        url: `/quizzes/${quizId}/attempt`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, quizId) => [{ type: 'Quiz', id: quizId }],
    }),

    // Submit quiz answers
    submitQuiz: builder.mutation<BaseApiResponse<SubmitQuizResponse>, SubmitQuizRequest>({
      query: ({ quizId, attemptId, answers }) => ({
        url: `/quizzes/${quizId}/submit`,
        method: 'POST',
        body: { attemptId, answers },
      }),
      invalidatesTags: (result, error, { quizId }) => [{ type: 'Quiz', id: quizId }],
    }),

    // Get quiz attempts for current user
    getQuizAttempts: builder.query<BaseApiResponse<{ attempts: QuizAttempt[] }>, string>({
      query: (quizId) => `/quizzes/${quizId}/attempts`,
      providesTags: (result, error, quizId) => [{ type: 'Quiz', id: quizId }],
    }),

    // Get quiz results and analytics (instructor only)
    getQuizResults: builder.query<BaseApiResponse<QuizResultsResponse>, string>({
      query: (quizId) => `/quizzes/${quizId}/results`,
      providesTags: (result, error, quizId) => [{ type: 'Quiz', id: quizId }],
    }),

    // Get quizzes for a specific course
    getCourseQuizzes: builder.query<BaseApiResponse<QuizPopulated[]>, string>({
      query: (courseId) => `/quizzes?courseId=${courseId}`,
      providesTags: (result, error, courseId) => [
        { type: 'Quiz', id: courseId },
        'Quiz'
      ],
    }),
  }),
});

export const {
  useGetQuizzesQuery,
  useGetQuizByIdQuery,
  useCreateQuizMutation,
  useUpdateQuizMutation,
  useDeleteQuizMutation,
  useStartQuizAttemptMutation,
  useSubmitQuizMutation,
  useGetQuizAttemptsQuery,
  useGetQuizResultsQuery,
  useGetCourseQuizzesQuery,
} = quizApi;