import { baseApi, BaseApiResponse } from './baseApi';
import { Article as BackendArticle } from '../../types/backend-models';

// API-specific interface for populated articles
export interface ArticlePopulated extends Omit<BackendArticle, 'author'> {
  author: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  readTime?: number; // Additional computed field for frontend
}

export interface CreateArticleRequest {
  title: string;
  content: string;
  excerpt?: string;
  category: string;
  tags?: string[];
  thumbnail?: string;
  status?: string;
  visibility?: string;
}

export interface UpdateArticleRequest {
  title?: string;
  content?: string;
  excerpt?: string;
  category?: string;
  tags?: string[];
  thumbnail?: string;
}

export interface ArticleListParams {
  page?: number;
  limit?: number;
  category?: string;
  tags?: string;
  status?: 'draft' | 'published' | 'archived';
  author?: string;
  sort?: 'newest' | 'oldest' | 'popular' | 'title';
  search?: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalResults: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: number | null;
  prevPage: number | null;
}

export interface ArticleListResponse {
  status: string;
  results: number;
  pagination: PaginationInfo;
  data: ArticlePopulated[];
}

export interface ArticleStats {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  totalViews: number;
  totalLikes: number;
  articlesThisMonth: number;
}

export const articleApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getArticles: builder.query<ArticleListResponse, ArticleListParams | void>({
      query: (params) => ({
        url: '/articles',
        params: params || {},
      }),
      providesTags: ['Article'],
    }),

    getArticleById: builder.query<BaseApiResponse<{ article: ArticlePopulated }>, string>({
      query: (id) => `/articles/${id}`,
      providesTags: (result, error, id) => [{ type: 'Article', id }],
    }),

    getMyArticles: builder.query<ArticleListResponse, ArticleListParams | void>({
      query: (params) => ({
        url: '/articles/my-articles',
        params: params || {},
      }),
      providesTags: ['Article'],
    }),

    createArticle: builder.mutation<BaseApiResponse<{ article: ArticlePopulated }>, CreateArticleRequest>({
      query: (data) => ({
        url: '/articles',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Article'],
    }),

    updateArticle: builder.mutation<BaseApiResponse<{ article: ArticlePopulated }>, { id: string; data: UpdateArticleRequest }>({
      query: ({ id, data }) => ({
        url: `/articles/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Article', id }, 'Article'],
    }),

    deleteArticle: builder.mutation<BaseApiResponse<void>, string>({
      query: (id) => ({
        url: `/articles/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Article', id }, 'Article'],
    }),

    likeArticle: builder.mutation<BaseApiResponse<{ message: string; liked: boolean }>, string>({
      query: (id) => ({
        url: `/articles/${id}/like`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Article', id }],
    }),

    unlikeArticle: builder.mutation<BaseApiResponse<{ message: string }>, string>({
      query: (id) => ({
        url: `/articles/${id}/like`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Article', id }],
    }),

    getArticleCategories: builder.query<BaseApiResponse<{ categories: string[] }>, void>({
      query: () => '/articles/categories',
      providesTags: ['Article'],
    }),

    getFeaturedArticles: builder.query<BaseApiResponse<ArticlePopulated[]>, { limit?: number }>({
      query: (params) => ({
        url: '/articles/featured',
        params,
      }),
      providesTags: ['Article'],
    }),

    getPopularArticles: builder.query<BaseApiResponse<ArticlePopulated[]>, { limit?: number; period?: 'week' | 'month' | 'year' }>({
      query: (params) => ({
        url: '/articles/popular',
        params,
      }),
      providesTags: ['Article'],
    }),

    getRelatedArticles: builder.query<BaseApiResponse<ArticlePopulated[]>, { id: string; limit?: number }>({
      query: ({ id, limit }) => ({
        url: `/articles/${id}/related`,
        params: { limit },
      }),
      providesTags: (result, error, { id }) => [{ type: 'Article', id: `${id}-related` }],
    }),

    getArticleStats: builder.query<BaseApiResponse<ArticleStats>, void>({
      query: () => '/articles/stats',
      providesTags: ['Article'],
    }),

    searchArticles: builder.query<BaseApiResponse<ArticlePopulated[]>, { query: string; filters?: ArticleListParams }>({
      query: ({ query, filters }) => ({
        url: '/articles/search',
        params: { q: query, ...filters },
      }),
      providesTags: ['Article'],
    }),

    exportArticles: builder.query<Blob, { format: 'pdf' | 'html' | 'markdown' } & ArticleListParams>({
      query: (params) => ({
        url: '/articles/export',
        params,
        responseHandler: (response) => response.blob(),
      }),
    }),

    duplicateArticle: builder.mutation<BaseApiResponse<{ article: ArticlePopulated }>, string>({
      query: (id) => ({
        url: `/articles/${id}/duplicate`,
        method: 'POST',
      }),
      invalidatesTags: ['Article'],
    }),

    publishArticle: builder.mutation<BaseApiResponse<{ article: ArticlePopulated }>, string>({
      query: (id) => ({
        url: `/articles/${id}/publish`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Article', id }, 'Article'],
    }),

    archiveArticle: builder.mutation<BaseApiResponse<{ article: ArticlePopulated }>, string>({
      query: (id) => ({
        url: `/articles/${id}/archive`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Article', id }, 'Article'],
    }),

    incrementArticleViews: builder.mutation<BaseApiResponse<{ views: number }>, string>({
      query: (id) => ({
        url: `/articles/${id}/view`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Article', id }],
    }),
  }),
});

export const {
  useGetArticlesQuery,
  useGetArticleByIdQuery,
  useGetMyArticlesQuery,
  useCreateArticleMutation,
  useUpdateArticleMutation,
  useDeleteArticleMutation,
  useLikeArticleMutation,
  useUnlikeArticleMutation,
  useGetArticleCategoriesQuery,
  useGetFeaturedArticlesQuery,
  useGetPopularArticlesQuery,
  useGetRelatedArticlesQuery,
  useGetArticleStatsQuery,
  useSearchArticlesQuery,
  useLazyExportArticlesQuery,
  useDuplicateArticleMutation,
  usePublishArticleMutation,
  useArchiveArticleMutation,
  useIncrementArticleViewsMutation,
} = articleApi;