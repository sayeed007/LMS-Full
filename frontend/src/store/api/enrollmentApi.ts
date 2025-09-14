import { baseApi, BaseApiResponse } from './baseApi';
import type { Course } from './courseApi';
import type { User } from '../slices/authSlice';

export interface Enrollment {
  _id: string;
  user: User | string;
  course: Course | string;
  enrolledAt: string;
  status: 'active' | 'completed' | 'dropped';
  progress: {
    completedLessons: string[];
    currentLesson?: string;
    completionPercentage: number;
    timeSpent: number;
    lastAccessed?: string;
  };
  certificate?: {
    issued: boolean;
    issuedAt?: string;
    certificateId?: string;
    downloadUrl?: string;
  };
  rating?: {
    value: number;
    review?: string;
    submittedAt: string;
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
  completed: boolean;
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
  userId?: string; // For admin enrolling users
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
    getEnrollments: builder.query<BaseApiResponse<Enrollment[]>, EnrollmentListParams | void>({
      query: (params) => ({
        url: '/enrollments',
        params,
      }),
      providesTags: ['Enrollment'],
    }),

    getEnrollmentById: builder.query<BaseApiResponse<{ enrollment: Enrollment }>, string>({
      query: (id) => `/enrollments/${id}`,
      providesTags: (result, error, id) => [{ type: 'Enrollment', id }],
    }),

    getMyEnrollments: builder.query<BaseApiResponse<Enrollment[]>, EnrollmentListParams | void>({
      query: (params) => ({
        url: '/enrollments/my-enrollments',
        params,
      }),
      providesTags: ['Enrollment'],
    }),

    getCourseEnrollments: builder.query<BaseApiResponse<Enrollment[]>, { courseId: string; params?: EnrollmentListParams }>({
      query: ({ courseId, params }) => ({
        url: `/courses/${courseId}/enrollments`,
        params,
      }),
      providesTags: (result, error, { courseId }) => [
        { type: 'Enrollment', id: courseId },
        'Enrollment'
      ],
    }),

    enrollInCourse: builder.mutation<BaseApiResponse<{ enrollment: Enrollment }>, CreateEnrollmentRequest>({
      query: (data) => ({
        url: '/enrollments',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Enrollment', 'Course'],
    }),

    bulkEnroll: builder.mutation<BaseApiResponse<{ enrollments: Enrollment[]; failed: Array<{ userId: string; error: string }> }>, BulkEnrollmentRequest>({
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

    updateProgress: builder.mutation<BaseApiResponse<{ enrollment: Enrollment }>, { enrollmentId: string; data: ProgressUpdate }>({
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

    markCourseComplete: builder.mutation<BaseApiResponse<{ enrollment: Enrollment }>, string>({
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

    rateCourse: builder.mutation<BaseApiResponse<{ enrollment: Enrollment }>, { enrollmentId: string; data: RateCourseRequest }>({
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

    updateRating: builder.mutation<BaseApiResponse<{ enrollment: Enrollment }>, { enrollmentId: string; data: RateCourseRequest }>({
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

    deleteRating: builder.mutation<BaseApiResponse<{ enrollment: Enrollment }>, string>({
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

    generateCertificate: builder.mutation<BaseApiResponse<{ enrollment: Enrollment; certificateUrl: string }>, string>({
      query: (enrollmentId) => ({
        url: `/enrollments/${enrollmentId}/certificate`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, enrollmentId) => [
        { type: 'Enrollment', id: enrollmentId },
        'Enrollment'
      ],
    }),

    downloadCertificate: builder.query<Blob, string>({
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
      enrollment: Enrollment;
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
  useGenerateCertificateMutation,
  useLazyDownloadCertificateQuery,
  useGetEnrollmentStatsQuery,
  useLazyExportEnrollmentsQuery,
  useGetProgressQuery,
  useGetDetailedProgressQuery,
} = enrollmentApi;