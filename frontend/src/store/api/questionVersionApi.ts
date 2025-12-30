import { baseApi } from './baseApi';

export interface QuestionVersion {
  _id: string;
  questionId: string;
  version: number;
  data: {
    text: string;
    type: string;
    choices?: Array<{
      text: string;
      isCorrect: boolean;
    }>;
    correctAnswer?: string;
    explanation?: string;
    difficulty?: string;
    points?: number;
    timeLimit?: number;
    tags?: string[];
    attachments?: any[];
  };
  changeDescription?: string;
  modifiedFields?: string[];
  changedBy: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  isAutoSaved?: boolean;
  dataSize?: number;
  createdAt: string;
  updatedAt: string;
  versionLabel?: string;
}

export interface VersionStats {
  totalVersions: number;
  firstVersion: {
    version: number;
    createdAt: string;
    createdBy: {
      name: string;
      email: string;
    };
  } | null;
  latestVersion: {
    version: number;
    createdAt: string;
    createdBy: {
      name: string;
      email: string;
    };
  } | null;
  totalStorageKB: string;
  totalContributors: number;
}

export interface VersionComparison {
  from: QuestionVersion;
  to: QuestionVersion;
  changes: {
    added?: any[];
    modified?: Array<{
      field: string;
      oldValue: any;
      newValue: any;
    }>;
    removed?: any[];
  };
}

export const questionVersionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all versions for a question
    getQuestionVersions: builder.query<
      {
        status: string;
        results: number;
        totalVersions: number;
        currentPage: number;
        totalPages: number;
        data: { versions: QuestionVersion[] };
      },
      { questionId: string; page?: number; limit?: number }
    >({
      query: ({ questionId, page = 1, limit = 20 }) => ({
        url: `/questions/${questionId}/versions`,
        params: { page, limit },
      }),
      providesTags: (result, error, { questionId }) => [
        { type: 'QuestionVersion', id: questionId },
        { type: 'QuestionVersion', id: 'LIST' },
      ],
    }),

    // Get latest version
    getLatestVersion: builder.query<
      { status: string; data: { version: QuestionVersion } },
      string
    >({
      query: (questionId) => `/questions/${questionId}/versions/latest`,
      providesTags: (result, error, questionId) => [
        { type: 'QuestionVersion', id: `${questionId}-latest` },
      ],
    }),

    // Get specific version
    getSpecificVersion: builder.query<
      { status: string; data: { version: QuestionVersion } },
      { questionId: string; versionNumber: number }
    >({
      query: ({ questionId, versionNumber }) =>
        `/questions/${questionId}/versions/${versionNumber}`,
      providesTags: (result, error, { questionId, versionNumber }) => [
        { type: 'QuestionVersion', id: `${questionId}-v${versionNumber}` },
      ],
    }),

    // Get version statistics
    getVersionStats: builder.query<
      { status: string; data: { stats: VersionStats } },
      string
    >({
      query: (questionId) => `/questions/${questionId}/versions/stats`,
      providesTags: (result, error, questionId) => [
        { type: 'QuestionVersion', id: `${questionId}-stats` },
      ],
    }),

    // Compare two versions
    compareVersions: builder.query<
      { status: string; data: VersionComparison },
      { questionId: string; from: number; to: number }
    >({
      query: ({ questionId, from, to }) => ({
        url: `/questions/${questionId}/versions/compare`,
        params: { from, to },
      }),
    }),

    // Restore a version
    restoreVersion: builder.mutation<
      {
        status: string;
        message: string;
        data: { question: any };
      },
      { questionId: string; versionNumber: number }
    >({
      query: ({ questionId, versionNumber }) => ({
        url: `/questions/${questionId}/versions/${versionNumber}/restore`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, { questionId }) => [
        { type: 'Question', id: questionId },
        { type: 'QuestionVersion', id: questionId },
        { type: 'QuestionVersion', id: 'LIST' },
      ],
    }),

    // Cleanup old versions (admin only)
    cleanupVersions: builder.mutation<
      {
        status: string;
        message: string;
        data: { deletedCount: number; keptCount: number };
      },
      { questionId: string; keepCount?: number }
    >({
      query: ({ questionId, keepCount = 50 }) => ({
        url: `/questions/${questionId}/versions/cleanup`,
        method: 'DELETE',
        params: { keepCount },
      }),
      invalidatesTags: (result, error, { questionId }) => [
        { type: 'QuestionVersion', id: questionId },
        { type: 'QuestionVersion', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetQuestionVersionsQuery,
  useGetLatestVersionQuery,
  useGetSpecificVersionQuery,
  useGetVersionStatsQuery,
  useCompareVersionsQuery,
  useRestoreVersionMutation,
  useCleanupVersionsMutation,
} = questionVersionApi;
