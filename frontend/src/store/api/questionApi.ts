import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithAuth } from './baseApi';

// Types
export interface Choice {
  _id?: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  _id: string;
  text: string;
  type: 'single-choice' | 'multiple-choice' | 'descriptive' | 'true-false' | 'fill-blank';
  choices: Choice[];
  correctAnswer?: string;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  timeLimit: number;
  tags: string[];
  attachments?: {
    name: string;
    url: string;
    type: 'image' | 'video' | 'audio' | 'document';
  }[];
  questionBank: {
    _id: string;
    name: string;
  };
  course: {
    _id: string;
    title: string;
  };
  section?: {
    _id: string;
    name: string;
  };
  createdBy: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  organization?: string;
  isActive: boolean;
  isPublic: boolean;
  timesUsed: number;
  averageScore: number;
  lastUsed?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuestionRequest {
  text: string;
  type: 'single-choice' | 'multiple-choice' | 'descriptive' | 'true-false' | 'fill-blank';
  choices?: Choice[];
  correctAnswer?: string;
  explanation?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  points?: number;
  timeLimit?: number;
  tags?: string[];
  questionBank: string;
  section?: string;
  isPublic?: boolean;
}

export interface UpdateQuestionRequest {
  text?: string;
  choices?: Choice[];
  correctAnswer?: string;
  explanation?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  points?: number;
  timeLimit?: number;
  tags?: string[];
  isPublic?: boolean;
}

export interface QuestionFilters {
  questionBankId?: string;
  courseId?: string;
  sectionId?: string;
  type?: string;
  difficulty?: string;
  tags?: string;
  my?: boolean;
  includeInactive?: boolean;
  page?: number;
  limit?: number;
  search?: string;
}

export interface BulkCreateQuestionsRequest {
  questionBankId: string;
  questions: CreateQuestionRequest[];
}

export interface SearchQuestionsFilters {
  q: string;
  type?: string;
  difficulty?: string;
  tags?: string;
}

export interface QuestionsResponse {
  status: string;
  results: number;
  data: {
    questions: Question[];
  };
}

export interface SingleQuestionResponse {
  status: string;
  data: {
    question: Question;
  };
}

export const questionApi = createApi({
  reducerPath: 'questionApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Question', 'Questions'],
  endpoints: (builder) => ({
    // Get all questions with filtering
    getQuestions: builder.query<QuestionsResponse, QuestionFilters>({
      query: (params) => ({
        url: '/questions',
        params: {
          ...params,
          my: params.my ? 'true' : undefined,
          includeInactive: params.includeInactive ? 'true' : undefined,
        },
      }),
      providesTags: ['Questions'],
    }),

    // Get question by ID
    getQuestion: builder.query<SingleQuestionResponse, string>({
      query: (id) => `/questions/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Question', id }],
    }),

    // Create question
    createQuestion: builder.mutation<SingleQuestionResponse, CreateQuestionRequest>({
      query: (data) => ({
        url: '/questions',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Questions'],
    }),

    // Update question
    updateQuestion: builder.mutation<SingleQuestionResponse, { id: string; data: UpdateQuestionRequest }>({
      query: ({ id, data }) => ({
        url: `/questions/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Question', id },
        'Questions',
      ],
    }),

    // Delete question
    deleteQuestion: builder.mutation<void, string>({
      query: (id) => ({
        url: `/questions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Question', id },
        'Questions',
      ],
    }),

    // Bulk create questions
    bulkCreateQuestions: builder.mutation<QuestionsResponse, BulkCreateQuestionsRequest>({
      query: (data) => ({
        url: '/questions/bulk',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Questions'],
    }),

    // Duplicate question
    duplicateQuestion: builder.mutation<SingleQuestionResponse, { id: string; questionBankId?: string }>({
      query: ({ id, questionBankId }) => ({
        url: `/questions/${id}/duplicate`,
        method: 'POST',
        body: { questionBankId },
      }),
      invalidatesTags: ['Questions'],
    }),

    // Search questions
    searchQuestions: builder.query<QuestionsResponse, SearchQuestionsFilters>({
      query: (params) => ({
        url: '/questions/search',
        params,
      }),
      providesTags: ['Questions'],
    }),

    // Get questions by course
    getQuestionsByCourse: builder.query<QuestionsResponse, string>({
      query: (courseId) => `/questions/course/${courseId}`,
      providesTags: ['Questions'],
    }),

    // Get questions by question bank
    getQuestionsByQuestionBank: builder.query<QuestionsResponse, { questionBankId: string; sectionId?: string }>({
      query: ({ questionBankId, sectionId }) => ({
        url: `/questions/question-bank/${questionBankId}`,
        params: { sectionId },
      }),
      providesTags: ['Questions'],
    }),

    // Get question types (for dropdown)
    getQuestionTypes: builder.query<{ data: { types: Array<{ value: string; label: string; description: string }> } }, void>({
      query: () => '/questions/types',
      providesTags: ['Questions'],
    }),

    // Get question statistics
    getQuestionStats: builder.query<{
      data: {
        totalQuestions: number;
        questionsByType: Record<string, number>;
        questionsByDifficulty: Record<string, number>;
        averagePointsPerQuestion: number;
      };
    }, { questionBankId?: string; courseId?: string }>({
      query: (params) => ({
        url: '/questions/stats',
        params,
      }),
      providesTags: ['Questions'],
    }),
  }),
});

export const {
  useGetQuestionsQuery,
  useGetQuestionQuery,
  useCreateQuestionMutation,
  useUpdateQuestionMutation,
  useDeleteQuestionMutation,
  useBulkCreateQuestionsMutation,
  useDuplicateQuestionMutation,
  useSearchQuestionsQuery,
  useGetQuestionsByCourseQuery,
  useGetQuestionsByQuestionBankQuery,
  useGetQuestionTypesQuery,
  useGetQuestionStatsQuery,
} = questionApi;