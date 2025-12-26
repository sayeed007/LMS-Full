import { baseApi, BaseApiResponse } from './baseApi';

// Dashboard stats interface for instructors/admins
export interface InstructorDashboardStats {
  totalCourseCreated: number;
  totalArticle: number;
  totalQuestionBank: number;
  totalLearner: number;
}

// Dashboard stats interface for students
export interface StudentDashboardStats {
  totalEnrolledCourses: number;
  totalCompletedCourses: number;
  totalInProgressCourses: number;
  completionRate: number;
}

export type DashboardStats = InstructorDashboardStats | StudentDashboardStats;

// Ongoing course interface (for students and instructors)
export interface OngoingCourse {
  _id: string;
  title: string;
  description: string;
  thumbnail?: string;
  instructor: {
    _id: string;
    name: string;
    email: string;
  };
  progress: number;
  completedLessons: number;
  totalLessons: number;
  rating: number;
  enrollmentId: string | null;
  lastAccessed: string;
  // Additional fields for instructors
  totalEnrollments?: number;
  activeEnrollments?: number;
  isPublished?: boolean;
}

// Course analytics interface
export interface CourseAnalytics {
  published: {
    count: number;
    percentage: number;
  };
  draft: {
    count: number;
    percentage: number;
  };
  inProgress: {
    count: number;
    percentage: number;
  };
  totalCourses: number;
  totalEnrollments: number;
}

// Completion rate data interface
export interface CompletionRateData {
  courseId: string;
  courseTitle: string;
  totalEnrollments: number;
  completedEnrollments: number;
  completionRate: number;
}

export interface CompletionRateParams {
  category?: string;
}

// RTK Query API
export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get dashboard stats
    getDashboardStats: builder.query<BaseApiResponse<DashboardStats>, void>({
      query: () => '/dashboard/stats',
      providesTags: ['User', 'Course', 'Enrollment'],
    }),

    // Get ongoing courses for students
    getOngoingCourses: builder.query<BaseApiResponse<OngoingCourse[]>, { limit?: number }>({
      query: (params) => ({
        url: '/dashboard/ongoing-courses',
        params,
      }),
      providesTags: ['Enrollment', 'Course'],
    }),

    // Get course analytics for instructors
    getCourseAnalytics: builder.query<BaseApiResponse<CourseAnalytics>, void>({
      query: () => '/dashboard/course-analytics',
      providesTags: ['Course', 'Enrollment'],
    }),

    // Get completion rate data for instructors
    getCompletionRateData: builder.query<BaseApiResponse<CompletionRateData[]>, CompletionRateParams>({
      query: (params) => ({
        url: '/dashboard/completion-rate',
        params,
      }),
      providesTags: ['Course', 'Enrollment'],
    }),

    // Get categories for dashboard filters
    getDashboardCategories: builder.query<BaseApiResponse<string[]>, void>({
      query: () => '/dashboard/categories',
      providesTags: ['Course'],
    }),
  }),
});

export const {
  useGetDashboardStatsQuery,
  useGetOngoingCoursesQuery,
  useGetCourseAnalyticsQuery,
  useGetCompletionRateDataQuery,
  useGetDashboardCategoriesQuery,
} = dashboardApi;
