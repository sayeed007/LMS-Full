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

export interface CommentListResponse {
  status: string;
  results: number;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalResults: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    nextPage: number | null;
    prevPage: number | null;
  };
  data: {
    comments: Comment[];
  };
}
