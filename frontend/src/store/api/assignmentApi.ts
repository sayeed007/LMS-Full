import { baseApi, BaseApiResponse } from './baseApi';

export interface Assignment {
  _id: string;
  title: string;
  description: string;
  instructions: string;
  course: string;
  lesson?: string;
  instructor: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  submissionType: 'text' | 'file' | 'url' | 'code';
  allowedFileTypes?: string[];
  maxFileSize?: number;
  maxFiles?: number;
  maxScore: number;
  passingScore?: number;
  dueDate: string;
  availableFrom?: string;
  availableUntil?: string;
  allowLateSubmissions?: boolean;
  latePenalty?: number;
  maxLateDays?: number;
  maxAttempts?: number;
  isPublished: boolean;
  isActive: boolean;
  stats?: {
    totalSubmissions: number;
    gradedSubmissions: number;
    averageScore: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Submission {
  _id: string;
  student: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  submittedAt: string;
  content?: string;
  files?: Array<{
    filename: string;
    originalName: string;
    url: string;
    size: number;
    mimeType: string;
  }>;
  url?: string;
  status: 'submitted' | 'late' | 'graded' | 'returned';
  grade?: {
    score: number;
    maxScore: number;
    percentage: number;
    feedback?: string;
    gradedBy?: {
      _id: string;
      name: string;
      email: string;
    };
    gradedAt?: string;
  };
  attempts: number;
  isLate: boolean;
}

export interface SubmitAssignmentRequest {
  content?: string;
  url?: string;
  files?: Array<{
    filename: string;
    originalName: string;
    url: string;
    size: number;
    mimeType: string;
  }>;
}

export interface GradeSubmissionRequest {
  score: number;
  feedback?: string;
}

export const assignmentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAssignmentsByCourse: builder.query<BaseApiResponse<Assignment[]>, string>({
      query: (courseId) => `/courses/${courseId}/assignments`,
      providesTags: (result, error, courseId) => [{ type: 'Assignment', id: courseId }],
    }),

    getAssignment: builder.query<BaseApiResponse<Assignment>, string>({
      query: (id) => `/assignments/${id}`,
      providesTags: (result, error, id) => [{ type: 'Assignment', id }],
    }),

    submitAssignment: builder.mutation<
      BaseApiResponse<{ submission: Submission; assignment: Assignment }>,
      { id: string; data: SubmitAssignmentRequest }
    >({
      query: ({ id, data }) => ({
        url: `/assignments/${id}/submit`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Assignment', id }],
    }),

    getMySubmission: builder.query<
      BaseApiResponse<{
        hasSubmitted: boolean;
        submission: Submission | null;
        canSubmit: boolean;
        attemptsUsed?: number;
        attemptsRemaining?: number;
        isGraded?: boolean;
        assignment?: Assignment;
      }>,
      string
    >({
      query: (id) => `/assignments/${id}/my-submission`,
      providesTags: (result, error, id) => [{ type: 'Assignment', id }],
    }),

    getAssignmentSubmissions: builder.query<
      BaseApiResponse<{
        assignment: Assignment;
        submissions: Submission[];
        notSubmitted: Array<{ _id: string; name: string; email: string; avatar?: string }>;
        stats: {
          total: number;
          graded: number;
          pending: number;
          averageScore: number;
          passRate: number;
        };
        summary: {
          totalStudents: number;
          submitted: number;
          notSubmitted: number;
          graded: number;
          pending: number;
        };
      }>,
      string
    >({
      query: (id) => `/assignments/${id}/submissions`,
      providesTags: (result, error, id) => [{ type: 'Assignment', id }],
    }),

    gradeSubmission: builder.mutation<
      BaseApiResponse<{ submission: Submission; stats: any }>,
      { assignmentId: string; submissionId: string; data: GradeSubmissionRequest }
    >({
      query: ({ assignmentId, submissionId, data }) => ({
        url: `/assignments/${assignmentId}/submissions/${submissionId}/grade`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { assignmentId }) => [{ type: 'Assignment', id: assignmentId }],
    }),
  }),
});

export const {
  useGetAssignmentsByCourseQuery,
  useGetAssignmentQuery,
  useSubmitAssignmentMutation,
  useGetMySubmissionQuery,
  useGetAssignmentSubmissionsQuery,
  useGradeSubmissionMutation,
} = assignmentApi;
