import { baseApi, BaseApiResponse } from './baseApi';
import { Course, CourseLesson, CourseChapter } from '../../types/backend-models';

// API-specific interfaces for requests/responses
export interface CoursePopulated extends Omit<Course, 'instructor' | 'createdBy'> {
  instructor: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
}

export interface CreateCourseRequest {
  title: string;
  description: string;
  shortDescription?: string;
  category: Course['category'];
  subcategory?: string;
  level: Course['level'];
  language: string;
  price: number;
  originalPrice?: number;
  discountPrice?: number;
  currency?: string;
  thumbnail?: string;
  previewVideo?: string;
  images?: string[];
  tags?: string[];
  prerequisites?: string[];
  learningObjectives?: string[];
  targetAudience?: string[];
  requirements?: string[];
  whatYouWillLearn?: string[];
  settings?: Partial<Course['settings']>;
}

export interface UpdateCourseRequest {
  title?: string;
  description?: string;
  shortDescription?: string;
  category?: Course['category'];
  subcategory?: string;
  level?: Course['level'];
  language?: string;
  price?: number;
  originalPrice?: number;
  discountPrice?: number;
  currency?: string;
  thumbnail?: string;
  previewVideo?: string;
  images?: string[];
  tags?: string[];
  prerequisites?: string[];
  learningObjectives?: string[];
  targetAudience?: string[];
  requirements?: string[];
  whatYouWillLearn?: string[];
  settings?: Partial<Course['settings']>;
  isPublished?: boolean;
  isFeatured?: boolean;
  isApproved?: boolean;
}

export interface CreateChapterRequest {
  title: string;
  description?: string;
  order: number;
}

export interface UpdateChapterRequest {
  title?: string;
  description?: string;
  order?: number;
  isPublished?: boolean;
}

export interface CreateLessonRequest {
  title: string;
  content: string;
  type: CourseLesson['type'];
  duration?: number;
  videoUrl?: string;
  videoThumbnail?: string;
  order: number;
  isPreview?: boolean;
  resources?: CourseLesson['resources'];
  quiz?: string;
  assignment?: CourseLesson['assignment'];
  completionCriteria?: CourseLesson['completionCriteria'];
  minTimeToComplete?: number;
  isPublished?: boolean;
}

export interface UpdateLessonRequest {
  title?: string;
  content?: string;
  type?: CourseLesson['type'];
  duration?: number;
  videoUrl?: string;
  videoThumbnail?: string;
  order?: number;
  isPreview?: boolean;
  resources?: CourseLesson['resources'];
  quiz?: string;
  assignment?: CourseLesson['assignment'];
  completionCriteria?: CourseLesson['completionCriteria'];
  minTimeToComplete?: number;
  isPublished?: boolean;
}

export interface CourseListParams {
  page?: number;
  limit?: number;
  category?: string;
  level?: string;
  instructor?: string;
  isPublished?: boolean;
  isFeatured?: boolean;
  isApproved?: boolean;
  tags?: string;
  search?: string;
  sort?: string;
  priceMin?: number;
  priceMax?: number;
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
    getCourses: builder.query<BaseApiResponse<CoursePopulated[]>, CourseListParams | void>({
      query: (params) => ({
        url: '/courses',
        params: params || {},
      }),
      providesTags: ['Course'],
    }),

    getCourseById: builder.query<BaseApiResponse<{ course: CoursePopulated }>, string>({
      query: (id) => `/courses/${id}`,
      providesTags: (result, error, id) => [{ type: 'Course', id }],
    }),

    getMyCourses: builder.query<BaseApiResponse<CoursePopulated[]>, CourseListParams | void>({
      query: (params) => ({
        url: '/courses/my-courses',
        params: params || {},
      }),
      providesTags: ['Course'],
    }),

    getEnrolledCourses: builder.query<BaseApiResponse<CoursePopulated[]>, CourseListParams | void>({
      query: (params) => ({
        url: '/courses/enrolled',
        params: params || {},
      }),
      providesTags: ['Course', 'Enrollment'],
    }),

    createCourse: builder.mutation<BaseApiResponse<{ course: CoursePopulated }>, CreateCourseRequest>({
      query: (data) => ({
        url: '/courses',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Course'],
    }),

    updateCourse: builder.mutation<BaseApiResponse<{ course: CoursePopulated }>, { id: string; data: UpdateCourseRequest }>({
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

    duplicateCourse: builder.mutation<BaseApiResponse<{ course: CoursePopulated }>, string>({
      query: (id) => ({
        url: `/courses/${id}/duplicate`,
        method: 'POST',
      }),
      invalidatesTags: ['Course'],
    }),

    publishCourse: builder.mutation<BaseApiResponse<{ course: CoursePopulated }>, string>({
      query: (id) => ({
        url: `/courses/${id}/publish`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Course', id }, 'Course'],
    }),

    archiveCourse: builder.mutation<BaseApiResponse<{ course: CoursePopulated }>, string>({
      query: (id) => ({
        url: `/courses/${id}/archive`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Course', id }, 'Course'],
    }),

    // Lessons
    getLessons: builder.query<BaseApiResponse<CourseLesson[]>, { courseId: string; params?: { page?: number; limit?: number } }>({
      query: ({ courseId, params }) => ({
        url: `/courses/${courseId}/lessons`,
        params,
      }),
      providesTags: (result, error, { courseId }) => [
        { type: 'Lesson', id: courseId },
        'Lesson'
      ],
    }),

    getLessonById: builder.query<BaseApiResponse<{ lesson: CourseLesson }>, { courseId: string; lessonId: string }>({
      query: ({ courseId, lessonId }) => `/courses/${courseId}/lessons/${lessonId}`,
      providesTags: (result, error, { lessonId }) => [{ type: 'Lesson', id: lessonId }],
    }),

    createLesson: builder.mutation<BaseApiResponse<{ lesson: CourseLesson }>, { courseId: string; data: CreateLessonRequest }>({
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

    updateLesson: builder.mutation<BaseApiResponse<{ lesson: CourseLesson }>, { courseId: string; lessonId: string; data: UpdateLessonRequest }>({
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

    reorderLessons: builder.mutation<BaseApiResponse<CourseLesson[]>, { courseId: string; lessons: Array<{ _id: string; order: number }> }>({
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
    getFeaturedCourses: builder.query<BaseApiResponse<CoursePopulated[]>, { limit?: number }>({
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