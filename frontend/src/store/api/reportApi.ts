import { baseApi, BaseApiResponse } from './baseApi';

// Report interfaces
export interface ReportStats {
  courseEnrolled: number;
  yetToStart: number;
  inProgress: number;
  completed: number;
}

export interface CourseReport {
  _id: string;
  courseId: string;
  name: string;
  courseName?: string;
  thumbnail?: string;
  enrollDate: string;
  completedDate: string | null;
  timeSpent: number | string;
  completion?: number;
  completionPercentage?: number;
  status: string;
  category?: string;
  level?: string;
}

export interface MyReportResponse {
  stats: ReportStats;
  courses: CourseReport[];
}

export interface LearnerInfo {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  memberSince?: string;
}

export interface IndividualLearnerStats extends ReportStats {
  totalTimeSpent?: number;
  averageCompletionRate?: number;
}

export interface IndividualLearnerReportResponse {
  learner: LearnerInfo;
  stats: IndividualLearnerStats;
  courses: CourseReport[];
}

export interface LessonProgress {
  _id: string;
  title: string;
  type?: string;
  duration?: number;
  order?: number;
  chapter?: string;
  chapterOrder?: number;
  startDate: string | null;
  timeSpent: number;
  completionPercentage: number;
  status: string;
  completedAt?: string | null;
  lesson?: string;
}

export interface CourseStats {
  completed: number;
  timeSpent: number;
  totalLessons: number;
  completedLessons: number;
  inProgressLessons: number;
  yetToStartLessons: number;
}

export interface LearnerCourseProgressResponse {
  course: {
    _id: string;
    title: string;
    description?: string;
  };
  enrollment: {
    _id: string;
    enrolledAt: string;
    status: string;
  };
  stats: CourseStats;
  lessons: LessonProgress[];
}

export interface MultipleLearnerItem {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  coursesEnrolled: number;
  yetToStart: number;
  inProgress: number;
  completed: number;
  completionPercentage: number;
}

export interface MultipleLearnerStats {
  totalLearners: number;
  totalCourseEnrollments: number;
  totalYetToStart: number;
  totalInProgress: number;
  totalCompleted: number;
}

export interface MultipleLearnersReportResponse {
  summaryStats: MultipleLearnerStats;
  learners: MultipleLearnerItem[];
}

export interface ArticleReportItem {
  _id: string;
  name: string;
  slug?: string;
  author?: {
    _id: string;
    name: string;
    email: string;
  };
  isPublished?: boolean;
  createdAt?: string;
  totalViewer: number;
  comments: number;
  rating: number;
  yesRating: number;
  noRating: number;
}

export interface ArticleReportStats {
  total: number;
  published: number;
  unpublished: number;
  totalViews: number;
  totalComments: number;
}

export interface ArticlesReportResponse {
  stats: ArticleReportStats;
  articles: ArticleReportItem[];
}

export interface MultipleLearnersRequest {
  search?: string;
  status?: string;
  courseId?: string;
  limit?: number;
  page?: number;
}

export interface ArticlesReportParams {
  search?: string;
  isPublished?: boolean | string;
  limit?: number;
  page?: number;
}

export interface LearnerListItem {
  value: string;
  label: string;
  email: string;
  avatar?: string;
}

export interface CourseListItem {
  value: string;
  label: string;
  category?: string;
  level?: string;
  thumbnail?: string;
}

export interface IndividualCourseReportResponse {
  course: {
    _id: string;
    title: string;
    description?: string;
    thumbnail?: string;
    instructor?: {
      _id: string;
      name: string;
    };
  };
  stats: {
    totalLearners: number;
    yetToStart: number;
    inProgress: number;
    completed: number;
  };
  users: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    userId: string;
    enrollDate: string;
    completedDate: string | null;
    timeSpent: number;
    completionPercentage: number;
    status: string;
  }[];
  lessonStats: {
    _id: string;
    lesson: string;
    type?: string;
    yetToStart: number;
    inProgress: number;
    completed: number;
  }[];
}

export interface CourseReportItem {
  _id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  instructor?: {
    _id: string;
    name: string;
    email: string;
  };
  isPublished: boolean;
  createdAt?: string;
  totalLearners: number;
  yetToStart: number;
  inProgress: number;
  completed: number;
}

export interface MultipleCoursesReportResponse {
  stats: {
    totalCourses: number;
    published: number;
    unpublished: number;
    totalEnrollments: number;
  };
  courses: CourseReportItem[];
}

export interface MultipleCoursesRequest {
  search?: string;
  category?: string;
  isPublished?: boolean;
  limit?: number;
  page?: number;
}

// RTK Query API
export const reportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get my report (current user's learning progress)
    getMyReport: builder.query<BaseApiResponse<MyReportResponse>, void>({
      query: () => '/reports/my-report',
      providesTags: ['Enrollment', 'Progress'],
    }),

    // Get individual learner report
    getIndividualLearnerReport: builder.query<BaseApiResponse<IndividualLearnerReportResponse>, string>({
      query: (learnerId) => `/reports/learner/${learnerId}`,
      providesTags: (result, error, learnerId) => [
        { type: 'Enrollment', id: learnerId },
        'Enrollment'
      ],
    }),

    // Get individual learner's course progress
    getLearnerCourseProgress: builder.query<
      BaseApiResponse<LearnerCourseProgressResponse>,
      { learnerId: string; courseId: string }
    >({
      query: ({ learnerId, courseId }) => `/reports/learner/${learnerId}/courses/${courseId}`,
      providesTags: (result, error, { learnerId, courseId }) => [
        { type: 'Progress', id: `${learnerId}-${courseId}` },
        'Progress'
      ],
    }),

    // Get multiple learners report
    getMultipleLearnersReport: builder.mutation<
      BaseApiResponse<MultipleLearnersReportResponse>,
      MultipleLearnersRequest
    >({
      query: (data) => ({
        url: '/reports/learners',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Enrollment'],
    }),

    // Get articles report
    getArticlesReport: builder.query<BaseApiResponse<ArticlesReportResponse>, ArticlesReportParams | void>({
      query: (params) => ({
        url: '/reports/articles',
        params: params || {},
      }),
      providesTags: ['Article'],
    }),

    // Get learners list (for dropdown/selection)
    getLearnersList: builder.query<BaseApiResponse<LearnerListItem[]>, string | void>({
      query: (search) => ({
        url: '/reports/learners/list',
        params: search ? { search } : {},
      }),
      providesTags: ['User'],
    }),

    // Get courses list (for dropdown/selection)
    getCoursesList: builder.query<BaseApiResponse<CourseListItem[]>, string | void>({
      query: (search) => ({
        url: '/reports/courses/list',
        params: search ? { search } : {},
      }),
      providesTags: ['Course'],
    }),

    // Get individual course report
    getIndividualCourseReport: builder.query<BaseApiResponse<IndividualCourseReportResponse>, string>({
      query: (courseId) => `/reports/course/${courseId}`,
      providesTags: (result, error, courseId) => [
        { type: 'Course', id: courseId },
        'Enrollment'
      ],
    }),

    // Get multiple courses report
    getMultipleCoursesReport: builder.mutation<
      BaseApiResponse<MultipleCoursesReportResponse>,
      MultipleCoursesRequest
    >({
      query: (data) => ({
        url: '/reports/courses',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Course'],
    }),

    // Export endpoints
    exportMyReportCSV: builder.query<Blob, void>({
      query: () => ({
        url: '/reports/my-report/export/csv',
        responseHandler: (response) => response.blob(),
      }),
    }),

    exportLearnerReportCSV: builder.query<Blob, string>({
      query: (learnerId) => ({
        url: `/reports/learner/${learnerId}/export/csv`,
        responseHandler: (response) => response.blob(),
      }),
    }),

    exportArticlesReportCSV: builder.query<Blob, ArticlesReportParams | void>({
      query: (params) => ({
        url: '/reports/articles/export/csv',
        params: params || {},
        responseHandler: (response) => response.blob(),
      }),
    }),

    exportMultipleLearnersCSV: builder.mutation<Blob, MultipleLearnersRequest>({
      query: (data) => ({
        url: '/reports/learners/export/csv',
        method: 'POST',
        body: data,
        responseHandler: (response) => response.blob(),
      }),
    }),
  }),
});

export const {
  useGetMyReportQuery,
  useGetIndividualLearnerReportQuery,
  useGetLearnerCourseProgressQuery,
  useGetMultipleLearnersReportMutation,
  useGetArticlesReportQuery,
  useGetLearnersListQuery,
  useGetCoursesListQuery,
  useGetIndividualCourseReportQuery,
  useGetMultipleCoursesReportMutation,
  useLazyExportMyReportCSVQuery,
  useLazyExportLearnerReportCSVQuery,
  useLazyExportArticlesReportCSVQuery,
  useExportMultipleLearnersCSVMutation,
} = reportApi;
