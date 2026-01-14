import { Enrollment as BackendEnrollment, Enrollment } from '../../types/backend-models';
import { baseApi, BaseApiResponse } from './baseApi';

// API-specific interface for populated enrollments
export interface EnrollmentPopulated extends Omit<BackendEnrollment, 'student' | 'course'> {
  student: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  course: {
    _id: string;
    title: string;
    thumbnail?: string;
    instructor: {
      _id: string;
      name: string;
    };
  };
}

export interface EnrollmentStats {
  totalEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  droppedEnrollments: number;
  completionRate: number;
  averageTimeSpent: number;
  enrollmentsThisMonth: number;
  completionsThisMonth: number;
}

export interface ProgressUpdate {
  lessonId: string;
  timeSpent?: number;
}

export interface EnrollmentListParams {
  page?: number;
  limit?: number;
  status?: 'active' | 'completed' | 'dropped';
  course?: string;
  user?: string;
  search?: string;
  sort?: string;
}

export interface CreateEnrollmentRequest {
  courseId: string;
}

export interface BulkEnrollmentRequest {
  courseId: string;
  userIds: string[];
}

export interface RateCourseRequest {
  rating: number;
  review?: string;
}

export const enrollmentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEnrollments: builder.query<BaseApiResponse<EnrollmentPopulated[]>, EnrollmentListParams | void>({
      query: (params) => ({
        url: '/enrollments',
        params: params || {},
      }),
      providesTags: ['Enrollment'],
    }),

    getEnrollmentById: builder.query<BaseApiResponse<{ enrollment: EnrollmentPopulated }>, string>({
      query: (id) => `/enrollments/${id}`,
      providesTags: (result, error, id) => [{ type: 'Enrollment', id }],
    }),

    getMyEnrollments: builder.query<BaseApiResponse<EnrollmentPopulated[]>, EnrollmentListParams | void>({
      query: (params) => ({
        url: '/enrollments/my-enrollments',
        params: params || {},
      }),
      providesTags: ['Enrollment'],
    }),

    getCourseEnrollments: builder.query<BaseApiResponse<EnrollmentPopulated[]>, { courseId: string; params?: EnrollmentListParams }>({
      query: ({ courseId, params }) => ({
        url: `/courses/${courseId}/enrollments`,
        params,
      }),
      providesTags: (result, error, { courseId }) => [
        { type: 'Enrollment', id: courseId },
        'Enrollment'
      ],
    }),

    enrollInCourse: builder.mutation<BaseApiResponse<{ enrollment: EnrollmentPopulated }>, CreateEnrollmentRequest>({
      query: (data) => ({
        url: '/enrollments',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Enrollment', 'Course'],
    }),

    bulkEnroll: builder.mutation<BaseApiResponse<{ enrollments: EnrollmentPopulated[]; failed: Array<{ userId: string; error: string }> }>, BulkEnrollmentRequest>({
      query: (data) => ({
        url: '/enrollments/bulk',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Enrollment', 'Course'],
    }),

    unenrollFromCourse: builder.mutation<BaseApiResponse<{ message: string }>, string>({
      query: (enrollmentId) => ({
        url: `/enrollments/${enrollmentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, enrollmentId) => [
        { type: 'Enrollment', id: enrollmentId },
        'Enrollment',
        'Course'
      ],
    }),

    updateProgress: builder.mutation<BaseApiResponse<{ enrollment: EnrollmentPopulated }>, { enrollmentId: string; data: ProgressUpdate }>({
      query: ({ enrollmentId, data }) => ({
        url: `/enrollments/${enrollmentId}/progress`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { enrollmentId }) => [
        { type: 'Enrollment', id: enrollmentId },
        'Enrollment',
        'Progress'
      ],
    }),

    markCourseComplete: builder.mutation<BaseApiResponse<{ enrollment: EnrollmentPopulated }>, string>({
      query: (enrollmentId) => ({
        url: `/enrollments/${enrollmentId}/complete`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, enrollmentId) => [
        { type: 'Enrollment', id: enrollmentId },
        'Enrollment',
        'Progress'
      ],
    }),

    rateCourse: builder.mutation<BaseApiResponse<{ enrollment: EnrollmentPopulated }>, { enrollmentId: string; data: RateCourseRequest }>({
      query: ({ enrollmentId, data }) => ({
        url: `/enrollments/${enrollmentId}/rating`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { enrollmentId }) => [
        { type: 'Enrollment', id: enrollmentId },
        'Enrollment',
        'Course'
      ],
    }),

    updateRating: builder.mutation<BaseApiResponse<{ enrollment: EnrollmentPopulated }>, { enrollmentId: string; data: RateCourseRequest }>({
      query: ({ enrollmentId, data }) => ({
        url: `/enrollments/${enrollmentId}/rating`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { enrollmentId }) => [
        { type: 'Enrollment', id: enrollmentId },
        'Enrollment',
        'Course'
      ],
    }),

    deleteRating: builder.mutation<BaseApiResponse<{ enrollment: EnrollmentPopulated }>, string>({
      query: (enrollmentId) => ({
        url: `/enrollments/${enrollmentId}/rating`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, enrollmentId) => [
        { type: 'Enrollment', id: enrollmentId },
        'Enrollment',
        'Course'
      ],
    }),

    downloadEnrollmentCertificate: builder.query<Blob, string>({
      query: (enrollmentId) => ({
        url: `/enrollments/${enrollmentId}/certificate/download`,
        responseHandler: (response) => response.blob(),
      }),
    }),

    getEnrollmentStats: builder.query<BaseApiResponse<EnrollmentStats>, { courseId?: string; userId?: string }>({
      query: (params) => ({
        url: '/enrollments/stats',
        params,
      }),
      providesTags: ['Enrollment'],
    }),

    exportEnrollments: builder.query<Blob, { format: 'csv' | 'excel'; courseId?: string } & EnrollmentListParams>({
      query: (params) => ({
        url: '/enrollments/export',
        params,
        responseHandler: (response) => response.blob(),
      }),
    }),

    // Progress tracking
    getProgress: builder.query<BaseApiResponse<{ progress: Enrollment['progress'] }>, { courseId: string; userId?: string }>({
      query: ({ courseId, userId }) => ({
        url: `/courses/${courseId}/progress`,
        params: userId ? { userId } : undefined,
      }),
      providesTags: (result, error, { courseId, userId }) => [
        { type: 'Progress', id: `${courseId}-${userId || 'me'}` },
        'Progress'
      ],
    }),

    getDetailedProgress: builder.query<BaseApiResponse<{
      enrollment: EnrollmentPopulated;
      lessonProgress: Array<{
        lesson: string;
        title: string;
        completed: boolean;
        timeSpent: number;
        completedAt?: string;
      }>;
    }>, string>({
      query: (enrollmentId) => `/enrollments/${enrollmentId}/detailed-progress`,
      providesTags: (result, error, enrollmentId) => [
        { type: 'Progress', id: enrollmentId },
        { type: 'Enrollment', id: enrollmentId }
      ],
    }),
  }),
});

export const {
  useGetEnrollmentsQuery,
  useGetEnrollmentByIdQuery,
  useGetMyEnrollmentsQuery,
  useGetCourseEnrollmentsQuery,
  useEnrollInCourseMutation,
  useBulkEnrollMutation,
  useUnenrollFromCourseMutation,
  useUpdateProgressMutation,
  useMarkCourseCompleteMutation,
  useRateCourseMutation,
  useUpdateRatingMutation,
  useDeleteRatingMutation,
  useLazyDownloadEnrollmentCertificateQuery,
  useGetEnrollmentStatsQuery,
  useLazyExportEnrollmentsQuery,
  useGetProgressQuery,
  useGetDetailedProgressQuery,
} = enrollmentApi;