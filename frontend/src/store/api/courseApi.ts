import { Course, CourseLesson, CourseChapter, LessonContent } from '../../types/backend-models';
import { baseApi, BaseApiResponse } from './baseApi';

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
  learningOutcomes?: string[];
  targetAudience?: string[];
  requirements?: string[];
  estimatedDuration?: number;
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
  learningOutcomes?: string[];
  targetAudience?: string[];
  requirements?: string[];
  estimatedDuration?: number;
  settings?: Partial<Course['settings']>;
  isPublished?: boolean;
  isFeatured?: boolean;
  isApproved?: boolean;
}

export interface CreateChapterRequest {
  title: string;
  description?: string;
  order?: number;
}

export interface UpdateChapterRequest {
  title?: string;
  description?: string;
  order?: number;
  isPublished?: boolean;
}

export interface CreateLessonRequest {
  title: string;
  description?: string;
  order?: number;
  estimatedDuration?: number;
  resources?: CourseLesson['resources'];
  isPreview?: boolean;
  isPremium?: boolean;
  isPublished?: boolean;
  settings?: CourseLesson['settings'];
  tags?: string[];
  language?: string;
  thumbnail?: string;
}

export interface UpdateLessonRequest {
  title?: string;
  description?: string;
  estimatedDuration?: number;
  resources?: CourseLesson['resources'];
  isPreview?: boolean;
  isPremium?: boolean;
  isPublished?: boolean;
  settings?: CourseLesson['settings'];
  tags?: string[];
  language?: string;
  thumbnail?: string;
}

// Content API interfaces
export interface CreateContentRequest {
  title: string;
  description?: string;
  type: LessonContent['type'];
  data: LessonContent['data'];
  order?: number;
  isPublished?: boolean;
  isPreview?: boolean;
  objectives?: string[];
  tags?: string[];
}

export interface UpdateContentRequest {
  title?: string;
  description?: string;
  type?: LessonContent['type'];
  data?: Partial<LessonContent['data']>;
  order?: number;
  isPublished?: boolean;
  isPreview?: boolean;
  objectives?: string[];
  tags?: string[];
}

export interface ContentListParams {
  page?: number;
  limit?: number;
  type?: LessonContent['type'];
  isPublished?: boolean;
  isPreview?: boolean;
}

export interface BulkContentOperation {
  contentId: string;
  action: 'update' | 'delete';
  data?: Partial<LessonContent>;
}

export interface BulkContentRequest {
  operations: BulkContentOperation[];
}

export interface MoveContentRequest {
  targetLessonId: string;
  newOrder?: number;
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
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
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
    getLessons: builder.query<BaseApiResponse<{ lessons: CourseLesson[] }>, { courseId: string; params?: { page?: number; limit?: number } }>({
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
        { type: 'Chapter', id: courseId },
        'Chapter',
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
        'Lesson',
        { type: 'Chapter', id: courseId },
        'Chapter'
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
        { type: 'Chapter', id: courseId },
        'Chapter',
        { type: 'Course', id: courseId }
      ],
    }),

    reorderLessons: builder.mutation<BaseApiResponse<CourseLesson[]>, { courseId: string; lessons: Array<{ _id: string; order: number }> }>({
      query: ({ courseId, lessons }) => ({
        url: `/courses/${courseId}/lessons/reorder`,
        method: 'PATCH',
        body: { lessons },
      }),
      async onQueryStarted({ courseId, lessons }, { dispatch, queryFulfilled }) {
        // Optimistically update the lessons cache
        const lessonsPatchResult = dispatch(
          courseApi.util.updateQueryData('getLessons', { courseId }, (draft) => {
            if (draft?.data?.lessons) {
              // Update lesson orders based on the reorder data
              draft.data.lessons.forEach((lesson) => {
                const reorderItem = lessons.find(item => item._id === lesson._id);
                if (reorderItem) {
                  lesson.order = reorderItem.order;
                }
              });
              // Sort lessons by the new order
              draft.data.lessons.sort((a, b) => (a.order || 0) - (b.order || 0));
            }
          })
        );

        // Also update chapters cache for lessons within chapters
        const chaptersPatchResult = dispatch(
          courseApi.util.updateQueryData('getChapters', { courseId }, (draft) => {
            if (draft?.data?.chapters) {
              draft.data.chapters.forEach((chapter) => {
                if (chapter.lessons) {
                  // Update lesson orders within chapters
                  chapter.lessons.forEach((lesson) => {
                    const reorderItem = lessons.find(item => item._id === lesson._id);
                    if (reorderItem) {
                      lesson.order = reorderItem.order;
                    }
                  });
                  // Sort lessons within each chapter
                  chapter.lessons.sort((a, b) => (a.order || 0) - (b.order || 0));
                }
              });
            }
          })
        );

        try {
          await queryFulfilled;
        } catch {
          // Revert both optimistic updates on error
          lessonsPatchResult.undo();
          chaptersPatchResult.undo();
        }
      },
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

    // Course Categories
    getCourseCategories: builder.query<BaseApiResponse<{ categories: string[] }>, void>({
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

    // Chapters
    getChapters: builder.query<BaseApiResponse<{ chapters: CourseChapter[] }>, { courseId: string; params?: { page?: number; limit?: number } }>({
      query: ({ courseId, params }) => ({
        url: `/courses/${courseId}/chapters`,
        params,
      }),
      providesTags: (result, error, { courseId }) => [
        { type: 'Chapter', id: courseId },
        'Chapter'
      ],
    }),

    getChapterById: builder.query<BaseApiResponse<{ chapter: CourseChapter }>, { courseId: string; chapterId: string }>({
      query: ({ courseId, chapterId }) => `/courses/${courseId}/chapters/${chapterId}`,
      providesTags: (result, error, { chapterId }) => [{ type: 'Chapter', id: chapterId }],
    }),

    createChapter: builder.mutation<BaseApiResponse<{ chapter: CourseChapter }>, { courseId: string; data: CreateChapterRequest }>({
      query: ({ courseId, data }) => ({
        url: `/courses/${courseId}/chapters`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { courseId }) => [
        { type: 'Chapter', id: courseId },
        'Chapter',
        { type: 'Course', id: courseId }
      ],
    }),

    updateChapter: builder.mutation<BaseApiResponse<{ chapter: CourseChapter }>, { courseId: string; chapterId: string; data: UpdateChapterRequest }>({
      query: ({ courseId, chapterId, data }) => ({
        url: `/courses/${courseId}/chapters/${chapterId}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { courseId, chapterId }) => [
        { type: 'Chapter', id: chapterId },
        { type: 'Chapter', id: courseId },
        'Chapter'
      ],
    }),

    deleteChapter: builder.mutation<BaseApiResponse<void>, { courseId: string; chapterId: string }>({
      query: ({ courseId, chapterId }) => ({
        url: `/courses/${courseId}/chapters/${chapterId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { courseId, chapterId }) => [
        { type: 'Chapter', id: chapterId },
        { type: 'Chapter', id: courseId },
        'Chapter',
        { type: 'Course', id: courseId }
      ],
    }),

    reorderChapters: builder.mutation<BaseApiResponse<CourseChapter[]>, { courseId: string; chapters: Array<{ _id: string; order: number }> }>({
      query: ({ courseId, chapters }) => ({
        url: `/courses/${courseId}/chapters/reorder`,
        method: 'PATCH',
        body: { chapters },
      }),
      async onQueryStarted({ courseId, chapters }, { dispatch, queryFulfilled }) {
        // Optimistically update the cache
        const patchResult = dispatch(
          courseApi.util.updateQueryData('getChapters', { courseId }, (draft) => {
            if (draft?.data?.chapters) {
              // Update chapter orders based on the reorder data
              draft.data.chapters.forEach((chapter) => {
                const reorderItem = chapters.find(item => item._id === chapter._id);
                if (reorderItem) {
                  chapter.order = reorderItem.order;
                }
              });
              // Sort chapters by the new order
              draft.data.chapters.sort((a, b) => (a.order || 0) - (b.order || 0));
            }
          })
        );

        try {
          await queryFulfilled;
        } catch {
          // Revert the optimistic update on error
          patchResult.undo();
        }
      },
      invalidatesTags: (result, error, { courseId }) => [
        { type: 'Chapter', id: courseId },
        'Chapter'
      ],
    }),

    // Content Management
    getContentByLesson: builder.query<BaseApiResponse<{ content: LessonContent[] }>, { courseId: string; lessonId: string; params?: ContentListParams }>({
      query: ({ courseId, lessonId, params }) => ({
        url: `/courses/${courseId}/lessons/${lessonId}/content`,
        params: params || {},
      }),
      providesTags: (result, error, { lessonId }) => [
        { type: 'Content', id: lessonId },
        'Content'
      ],
    }),

    getContentById: builder.query<BaseApiResponse<{ content: LessonContent }>, { courseId: string; lessonId: string; contentId: string }>({
      query: ({ courseId, lessonId, contentId }) => `/courses/${courseId}/lessons/${lessonId}/content/${contentId}`,
      providesTags: (result, error, { contentId }) => [{ type: 'Content', id: contentId }],
    }),

    createContent: builder.mutation<BaseApiResponse<{ content: LessonContent }>, { courseId: string; lessonId: string; data: CreateContentRequest }>({
      query: ({ courseId, lessonId, data }) => ({
        url: `/courses/${courseId}/lessons/${lessonId}/content`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { courseId, lessonId }) => [
        { type: 'Content', id: lessonId },
        'Content',
        { type: 'Lesson', id: lessonId },
        { type: 'Course', id: courseId }
      ],
    }),

    updateContent: builder.mutation<BaseApiResponse<{ content: LessonContent }>, { courseId: string; lessonId: string; contentId: string; data: UpdateContentRequest }>({
      query: ({ courseId, lessonId, contentId, data }) => ({
        url: `/courses/${courseId}/lessons/${lessonId}/content/${contentId}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { lessonId, contentId }) => [
        { type: 'Content', id: contentId },
        { type: 'Content', id: lessonId },
        'Content'
      ],
    }),

    deleteContent: builder.mutation<BaseApiResponse<void>, { courseId: string; lessonId: string; contentId: string }>({
      query: ({ courseId, lessonId, contentId }) => ({
        url: `/courses/${courseId}/lessons/${lessonId}/content/${contentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { courseId, lessonId, contentId }) => [
        { type: 'Content', id: contentId },
        { type: 'Content', id: lessonId },
        'Content',
        { type: 'Lesson', id: lessonId },
        { type: 'Course', id: courseId }
      ],
    }),

    reorderContent: builder.mutation<BaseApiResponse<{ content: LessonContent[] }>, { courseId: string; lessonId: string; content: Array<{ _id: string; order: number }> }>({
      query: ({ courseId, lessonId, content }) => ({
        url: `/courses/${courseId}/lessons/${lessonId}/content/reorder`,
        method: 'PATCH',
        body: { content },
      }),
      invalidatesTags: (result, error, { lessonId }) => [
        { type: 'Content', id: lessonId },
        'Content'
      ],
    }),

    moveContent: builder.mutation<BaseApiResponse<{ content: LessonContent }>, { courseId: string; lessonId: string; contentId: string; data: MoveContentRequest }>({
      query: ({ courseId, lessonId, contentId, data }) => ({
        url: `/courses/${courseId}/lessons/${lessonId}/content/${contentId}/move`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { courseId, lessonId, contentId, data }) => [
        { type: 'Content', id: contentId },
        { type: 'Content', id: lessonId },
        { type: 'Content', id: data.targetLessonId },
        'Content',
        { type: 'Course', id: courseId }
      ],
    }),

    getContentByType: builder.query<BaseApiResponse<{ content: LessonContent[] }>, { courseId: string; type?: LessonContent['type'] }>({
      query: ({ courseId, type }) => ({
        url: `/courses/${courseId}/content/by-type`,
        params: type ? { type } : {},
      }),
      providesTags: ['Content'],
    }),

    bulkUpdateContent: builder.mutation<BaseApiResponse<{ message: string }>, { courseId: string; lessonId: string; data: BulkContentRequest }>({
      query: ({ courseId, lessonId, data }) => ({
        url: `/courses/${courseId}/lessons/${lessonId}/content/bulk`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { courseId, lessonId }) => [
        { type: 'Content', id: lessonId },
        'Content',
        { type: 'Course', id: courseId }
      ],
    }),

    // Admin approval endpoints
    getPendingCourses: builder.query<BaseApiResponse<CoursePopulated[]>, { page?: number; limit?: number }>({
      query: (params) => ({
        url: '/courses/pending',
        params,
      }),
      providesTags: ['Course'],
    }),

    approveCourse: builder.mutation<BaseApiResponse<CoursePopulated>, { id: string; feedback?: string }>({
      query: ({ id, feedback }) => ({
        url: `/courses/${id}/approve`,
        method: 'PATCH',
        body: feedback ? { feedback } : {},
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Course', id }, 'Course'],
    }),

    rejectCourse: builder.mutation<BaseApiResponse<{ course: CoursePopulated; rejectionReason: string }>, { id: string; reason: string }>({
      query: ({ id, reason }) => ({
        url: `/courses/${id}/reject`,
        method: 'PATCH',
        body: { reason },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Course', id }, 'Course'],
    }),

    revokeApproval: builder.mutation<BaseApiResponse<CoursePopulated>, { id: string; reason: string }>({
      query: ({ id, reason }) => ({
        url: `/courses/${id}/revoke-approval`,
        method: 'PATCH',
        body: { reason },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Course', id }, 'Course'],
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
  useGetChaptersQuery,
  useGetChapterByIdQuery,
  useCreateChapterMutation,
  useUpdateChapterMutation,
  useDeleteChapterMutation,
  useReorderChaptersMutation,
  useGetCourseStatsQuery,
  useGetCourseCategoriesQuery,
  useGetFeaturedCoursesQuery,
  // Content hooks
  useGetContentByLessonQuery,
  useGetContentByIdQuery,
  useCreateContentMutation,
  useUpdateContentMutation,
  useDeleteContentMutation,
  useReorderContentMutation,
  useMoveContentMutation,
  useGetContentByTypeQuery,
  useBulkUpdateContentMutation,
  // Admin approval hooks
  useGetPendingCoursesQuery,
  useApproveCourseMutation,
  useRejectCourseMutation,
  useRevokeApprovalMutation,
} = courseApi;