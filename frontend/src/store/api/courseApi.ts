import { baseApi, BaseApiResponse } from './baseApi';

export interface Course {
  _id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  thumbnail?: string;
  instructor: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  organization?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  language: string;
  price: {
    amount: number;
    currency: string;
  };
  isPaid: boolean;
  status: 'draft' | 'published' | 'archived';
  visibility: 'public' | 'private' | 'organization';
  requirements: string[];
  learningOutcomes: string[];
  settings: {
    allowComments: boolean;
    allowRating: boolean;
    certificate: boolean;
    downloadable: boolean;
    dripContent: boolean;
  };
  stats: {
    totalEnrollments: number;
    averageRating: number;
    totalReviews: number;
    completionRate: number;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Lesson {
  _id: string;
  title: string;
  description: string;
  content: string;
  type: 'text' | 'video' | 'quiz' | 'assignment';
  order: number;
  duration: number;
  resources: Array<{
    title: string;
    url: string;
    type: 'pdf' | 'video' | 'link' | 'document';
  }>;
  isPreview: boolean;
  settings: {
    allowComments: boolean;
    downloadable: boolean;
  };
  course: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCourseRequest {
  title: string;
  description: string;
  category: string;
  tags?: string[];
  thumbnail?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  language: string;
  price: {
    amount: number;
    currency: string;
  };
  isPaid: boolean;
  visibility: 'public' | 'private' | 'organization';
  requirements?: string[];
  learningOutcomes?: string[];
  settings?: {
    allowComments: boolean;
    allowRating: boolean;
    certificate: boolean;
    downloadable: boolean;
    dripContent: boolean;
  };
}

export interface UpdateCourseRequest extends Partial<CreateCourseRequest> {
  status?: 'draft' | 'published' | 'archived';
  isActive?: boolean;
}

export interface CreateLessonRequest {
  title: string;
  description: string;
  content: string;
  type: 'text' | 'video' | 'quiz' | 'assignment';
  order: number;
  duration: number;
  resources?: Array<{
    title: string;
    url: string;
    type: 'pdf' | 'video' | 'link' | 'document';
  }>;
  isPreview?: boolean;
  settings?: {
    allowComments: boolean;
    downloadable: boolean;
  };
}

export interface UpdateLessonRequest extends Partial<CreateLessonRequest> {}

export interface CourseListParams {
  page?: number;
  limit?: number;
  category?: string;
  instructor?: string;
  difficulty?: string;
  status?: string;
  visibility?: string;
  isPaid?: boolean;
  tags?: string;
  search?: string;
  sort?: string;
}

export interface CourseStatsResponse {
  totalCourses: number;
  publishedCourses: number;
  draftCourses: number;
  totalEnrollments: number;
  averageRating: number;
  coursesThisMonth: number;
  enrollmentsThisMonth: number;
}

export const courseApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCourses: builder.query<BaseApiResponse<Course[]>, CourseListParams | void>({
      query: (params) => ({
        url: '/courses',
        params,
      }),
      providesTags: ['Course'],
    }),

    getCourseById: builder.query<BaseApiResponse<{ course: Course }>, string>({
      query: (id) => `/courses/${id}`,
      providesTags: (result, error, id) => [{ type: 'Course', id }],
    }),

    getMyCourses: builder.query<BaseApiResponse<Course[]>, CourseListParams | void>({
      query: (params) => ({
        url: '/courses/my-courses',
        params,
      }),
      providesTags: ['Course'],
    }),

    getEnrolledCourses: builder.query<BaseApiResponse<Course[]>, CourseListParams | void>({
      query: (params) => ({
        url: '/courses/enrolled',
        params,
      }),
      providesTags: ['Course', 'Enrollment'],
    }),

    createCourse: builder.mutation<BaseApiResponse<{ course: Course }>, CreateCourseRequest>({
      query: (data) => ({
        url: '/courses',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Course'],
    }),

    updateCourse: builder.mutation<BaseApiResponse<{ course: Course }>, { id: string; data: UpdateCourseRequest }>({
      query: ({ id, data }) => ({
        url: `/courses/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Course', id }, 'Course'],
    }),

    deleteCourse: builder.mutation<BaseApiResponse<void>, string>({
      query: (id) => ({
        url: `/courses/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Course', id }, 'Course'],
    }),

    duplicateCourse: builder.mutation<BaseApiResponse<{ course: Course }>, string>({
      query: (id) => ({
        url: `/courses/${id}/duplicate`,
        method: 'POST',
      }),
      invalidatesTags: ['Course'],
    }),

    publishCourse: builder.mutation<BaseApiResponse<{ course: Course }>, string>({
      query: (id) => ({
        url: `/courses/${id}/publish`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Course', id }, 'Course'],
    }),

    archiveCourse: builder.mutation<BaseApiResponse<{ course: Course }>, string>({
      query: (id) => ({
        url: `/courses/${id}/archive`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Course', id }, 'Course'],
    }),

    // Lessons
    getLessons: builder.query<BaseApiResponse<Lesson[]>, { courseId: string; params?: { page?: number; limit?: number } }>({
      query: ({ courseId, params }) => ({
        url: `/courses/${courseId}/lessons`,
        params,
      }),
      providesTags: (result, error, { courseId }) => [
        { type: 'Lesson', id: courseId },
        'Lesson'
      ],
    }),

    getLessonById: builder.query<BaseApiResponse<{ lesson: Lesson }>, { courseId: string; lessonId: string }>({
      query: ({ courseId, lessonId }) => `/courses/${courseId}/lessons/${lessonId}`,
      providesTags: (result, error, { lessonId }) => [{ type: 'Lesson', id: lessonId }],
    }),

    createLesson: builder.mutation<BaseApiResponse<{ lesson: Lesson }>, { courseId: string; data: CreateLessonRequest }>({
      query: ({ courseId, data }) => ({
        url: `/courses/${courseId}/lessons`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { courseId }) => [
        { type: 'Lesson', id: courseId },
        'Lesson',
        { type: 'Course', id: courseId }
      ],
    }),

    updateLesson: builder.mutation<BaseApiResponse<{ lesson: Lesson }>, { courseId: string; lessonId: string; data: UpdateLessonRequest }>({
      query: ({ courseId, lessonId, data }) => ({
        url: `/courses/${courseId}/lessons/${lessonId}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { courseId, lessonId }) => [
        { type: 'Lesson', id: lessonId },
        { type: 'Lesson', id: courseId },
        'Lesson'
      ],
    }),

    deleteLesson: builder.mutation<BaseApiResponse<void>, { courseId: string; lessonId: string }>({
      query: ({ courseId, lessonId }) => ({
        url: `/courses/${courseId}/lessons/${lessonId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { courseId, lessonId }) => [
        { type: 'Lesson', id: lessonId },
        { type: 'Lesson', id: courseId },
        'Lesson',
        { type: 'Course', id: courseId }
      ],
    }),

    reorderLessons: builder.mutation<BaseApiResponse<Lesson[]>, { courseId: string; lessons: Array<{ _id: string; order: number }> }>({
      query: ({ courseId, lessons }) => ({
        url: `/courses/${courseId}/lessons/reorder`,
        method: 'PATCH',
        body: { lessons },
      }),
      invalidatesTags: (result, error, { courseId }) => [
        { type: 'Lesson', id: courseId },
        'Lesson'
      ],
    }),

    // Course Statistics
    getCourseStats: builder.query<BaseApiResponse<CourseStatsResponse>, void>({
      query: () => '/courses/stats',
      providesTags: ['Course'],
    }),

    // Categories
    getCategories: builder.query<BaseApiResponse<{ categories: string[] }>, void>({
      query: () => '/courses/categories',
      providesTags: ['Course'],
    }),

    // Featured Courses
    getFeaturedCourses: builder.query<BaseApiResponse<Course[]>, { limit?: number }>({
      query: (params) => ({
        url: '/courses/featured',
        params,
      }),
      providesTags: ['Course'],
    }),
  }),
});

export const {
  useGetCoursesQuery,
  useGetCourseByIdQuery,
  useGetMyCoursesQuery,
  useGetEnrolledCoursesQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
  useDuplicateCourseMutation,
  usePublishCourseMutation,
  useArchiveCourseMutation,
  useGetLessonsQuery,
  useGetLessonByIdQuery,
  useCreateLessonMutation,
  useUpdateLessonMutation,
  useDeleteLessonMutation,
  useReorderLessonsMutation,
  useGetCourseStatsQuery,
  useGetCategoriesQuery,
  useGetFeaturedCoursesQuery,
} = courseApi;