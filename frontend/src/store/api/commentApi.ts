import { baseApi, BaseApiResponse } from './baseApi';

export interface Comment {
  _id: string;
  content: string;
  article: string;
  author: {
    _id: string;
    name: string;
    avatar?: string;
  };
  parentComment?: string | null;
  status: 'active' | 'deleted' | 'flagged';
  likes: number;
  likedBy?: string[];
  isEdited: boolean;
  editedAt?: string;
  createdAt: string;
  updatedAt: string;
  replies?: Comment[];
  repliesCount?: number;
}

export interface CreateCommentRequest {
  content: string;
  parentComment?: string;
}

export interface UpdateCommentRequest {
  content: string;
}

export interface CommentListParams {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'likes';
  order?: 'asc' | 'desc';
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

export interface CommentListResponse {
  status: string;
  results: number;
  pagination: PaginationInfo;
  data: {
    comments: Comment[];
  };
}

export const commentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getArticleComments: builder.query<CommentListResponse, { articleId: string } & CommentListParams>({
      query: ({ articleId, ...params }) => ({
        url: `/articles/${articleId}/comments`,
        params,
      }),
      providesTags: (result, error, { articleId }) => [
        { type: 'Comment' as const, id: `ARTICLE_${articleId}` },
      ],
    }),

    getCommentById: builder.query<BaseApiResponse<{ comment: Comment }>, { articleId: string; commentId: string }>({
      query: ({ articleId, commentId }) => `/articles/${articleId}/comments/${commentId}`,
      providesTags: (result, error, { commentId }) => [{ type: 'Comment' as const, id: commentId }],
    }),

    getCommentReplies: builder.query<CommentListResponse, { articleId: string; commentId: string } & CommentListParams>({
      query: ({ articleId, commentId, ...params }) => ({
        url: `/articles/${articleId}/comments/${commentId}/replies`,
        params,
      }),
      providesTags: (result, error, { commentId }) => [
        { type: 'Comment' as const, id: `REPLIES_${commentId}` },
      ],
    }),

    createComment: builder.mutation<BaseApiResponse<{ comment: Comment }>, { articleId: string; data: CreateCommentRequest }>({
      query: ({ articleId, data }) => ({
        url: `/articles/${articleId}/comments`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { articleId }) => [
        { type: 'Comment' as const, id: `ARTICLE_${articleId}` },
      ],
    }),

    updateComment: builder.mutation<BaseApiResponse<{ comment: Comment }>, { articleId: string; commentId: string; data: UpdateCommentRequest }>({
      query: ({ articleId, commentId, data }) => ({
        url: `/articles/${articleId}/comments/${commentId}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { commentId, articleId }) => [
        { type: 'Comment' as const, id: commentId },
        { type: 'Comment' as const, id: `ARTICLE_${articleId}` },
      ],
    }),

    deleteComment: builder.mutation<BaseApiResponse<void>, { articleId: string; commentId: string }>({
      query: ({ articleId, commentId }) => ({
        url: `/articles/${articleId}/comments/${commentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { commentId, articleId }) => [
        { type: 'Comment' as const, id: commentId },
        { type: 'Comment' as const, id: `ARTICLE_${articleId}` },
      ],
    }),

    toggleLikeComment: builder.mutation<BaseApiResponse<{ comment: Comment; isLiked: boolean }>, { articleId: string; commentId: string }>({
      query: ({ articleId, commentId }) => ({
        url: `/articles/${articleId}/comments/${commentId}/like`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, { commentId }) => [
        { type: 'Comment' as const, id: commentId },
      ],
    }),
  }),
});

export const {
  useGetArticleCommentsQuery,
  useLazyGetArticleCommentsQuery,
  useGetCommentByIdQuery,
  useGetCommentRepliesQuery,
  useCreateCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
  useToggleLikeCommentMutation,
} = commentApi;
