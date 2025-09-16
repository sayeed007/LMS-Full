import { baseApi } from './baseApi';
import { QuestionBank as BackendQuestionBank, User } from '../../types/backend-models';

// API-specific types for populated question banks
export interface QuestionBankPopulated extends Omit<BackendQuestionBank, 'createdBy'> {
  sections: Section[]; // Local section interface
  createdBy: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  // Additional computed fields
  totalQuestions?: number;
  averageDifficulty?: 'easy' | 'medium' | 'hard';
  estimatedDuration?: number;
  timesUsed?: number;
  averageScore?: number;
  lastUsed?: string;
  thumbnail?: string;
  color?: string;
}

// Keep for backward compatibility
export interface QuestionBank extends QuestionBankPopulated {}

export interface Section {
  _id: string;
  name: string;
  description?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionBankSettings {
  randomizeQuestions: boolean;
  randomizeChoices: boolean;
  defaultPointsPerQuestion: number;
  passingScore: number;
  defaultTimeLimit: number;
  allowRetakes: boolean;
  maxAttempts: number;
  showCorrectAnswers: boolean;
  showExplanations: boolean;
  showScoreImmediately: boolean;
}

export interface CreateQuestionBankRequest {
  name: string;
  description?: string;
  course: string;
}

export interface UpdateQuestionBankRequest {
  name?: string;
  description?: string;
}

export interface QuestionBankFilters {
  courseId?: string;
  my?: boolean;
  page?: number;
  limit?: number;
  search?: string;
}

export interface QuestionBankResponse {
  status: string;
  results: number;
  data: {
    questionBanks: QuestionBank[];
  };
}

export interface SingleQuestionBankResponse {
  status: string;
  data: {
    questionBank: QuestionBank;
  };
}

export const questionBankApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all question banks with filtering
    getQuestionBanks: builder.query<QuestionBankResponse, QuestionBankFilters | void>({
      query: (params = {}) => ({
        url: '/question-banks',
        params: {
          ...params,
          my: params.my ? 'true' : undefined,
        },
      }),
      providesTags: ['QuestionBanks'],
    }),

    // Get question bank by ID
    getQuestionBank: builder.query<SingleQuestionBankResponse, string>({
      query: (id) => `/question-banks/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'QuestionBank', id }],
    }),

    // Create question bank
    createQuestionBank: builder.mutation<SingleQuestionBankResponse, CreateQuestionBankRequest>({
      query: (data) => ({
        url: '/question-banks',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['QuestionBanks'],
    }),

    // Update question bank
    updateQuestionBank: builder.mutation<SingleQuestionBankResponse, { id: string; data: UpdateQuestionBankRequest }>({
      query: ({ id, data }) => ({
        url: `/question-banks/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'QuestionBank', id },
        'QuestionBanks',
      ],
    }),

    // Delete question bank
    deleteQuestionBank: builder.mutation<void, string>({
      query: (id) => ({
        url: `/question-banks/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'QuestionBank', id },
        'QuestionBanks',
      ],
    }),

    // Add section to question bank
    addSection: builder.mutation<SingleQuestionBankResponse, { id: string; data: Partial<Section> }>({
      query: ({ id, data }) => ({
        url: `/question-banks/${id}/sections`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'QuestionBank', id },
        'QuestionBanks',
      ],
    }),

    // Update section
    updateSection: builder.mutation<SingleQuestionBankResponse, { id: string; sectionId: string; data: Partial<Section> }>({
      query: ({ id, sectionId, data }) => ({
        url: `/question-banks/${id}/sections/${sectionId}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'QuestionBank', id },
        'QuestionBanks',
      ],
    }),

    // Delete section
    deleteSection: builder.mutation<void, { id: string; sectionId: string }>({
      query: ({ id, sectionId }) => ({
        url: `/question-banks/${id}/sections/${sectionId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'QuestionBank', id },
        'QuestionBanks',
      ],
    }),

    // Activate question bank
    activateQuestionBank: builder.mutation<SingleQuestionBankResponse, string>({
      query: (id) => ({
        url: `/question-banks/${id}/activate`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'QuestionBank', id },
        'QuestionBanks',
      ],
    }),

    // Archive question bank
    archiveQuestionBank: builder.mutation<SingleQuestionBankResponse, string>({
      query: (id) => ({
        url: `/question-banks/${id}/archive`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'QuestionBank', id },
        'QuestionBanks',
      ],
    }),

    // Duplicate question bank
    duplicateQuestionBank: builder.mutation<SingleQuestionBankResponse, { id: string; includeQuestions?: boolean }>({
      query: ({ id, includeQuestions = false }) => ({
        url: `/question-banks/${id}/duplicate`,
        method: 'POST',
        body: { includeQuestions },
      }),
      invalidatesTags: ['QuestionBanks'],
    }),

    // Get question banks by course
    getQuestionBanksByCourse: builder.query<QuestionBankResponse, { courseId: string; status?: string; visibility?: string }>({
      query: ({ courseId, status, visibility }) => ({
        url: `/question-banks/course/${courseId}`,
        params: { status, visibility },
      }),
      providesTags: ['QuestionBanks'],
    }),

    // Get question bank categories (for dropdown)
    getQuestionBankCategories: builder.query<{ data: { categories: string[] } }, void>({
      query: () => '/question-banks/categories',
      providesTags: ['QuestionBanks'],
    }),
  }),
});

export const {
  useGetQuestionBanksQuery,
  useGetQuestionBankQuery,
  useCreateQuestionBankMutation,
  useUpdateQuestionBankMutation,
  useDeleteQuestionBankMutation,
  useAddSectionMutation,
  useUpdateSectionMutation,
  useDeleteSectionMutation,
  useActivateQuestionBankMutation,
  useArchiveQuestionBankMutation,
  useDuplicateQuestionBankMutation,
  useGetQuestionBanksByCourseQuery,
  useGetQuestionBankCategoriesQuery,
} = questionBankApi;