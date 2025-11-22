import { baseApi, BaseApiResponse } from './baseApi';

// Interfaces
export interface Message {
  _id: string;
  conversation: string;
  sender: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  receiver: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  content: string;
  messageType: 'text' | 'file' | 'image' | 'system';
  attachments?: Array<{
    url: string;
    publicId?: string;
    fileName?: string;
    fileType?: string;
    fileSize?: number;
  }>;
  isRead: boolean;
  readAt?: string;
  isEdited: boolean;
  editedAt?: string;
  isDeleted: boolean;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  _id: string;
  participants: Array<{
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    role: string;
  }>;
  lastMessage?: Message;
  lastMessageAt: string;
  unreadCount: number;
  isActive: boolean;
  isArchived: boolean;
  otherParticipant: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    role: string;
  };
  metadata?: {
    courseId?: string;
    courseTitle?: string;
    subject?: string;
    tags?: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface ConversationListResponse extends BaseApiResponse<Conversation[]> {
  results: number;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalConversations: number;
  };
}

export interface MessagesListResponse extends BaseApiResponse<Message[]> {
  results: number;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalMessages: number;
    hasMore: boolean;
  };
}

export interface SendMessageRequest {
  receiverId?: string;
  conversationId?: string;
  content: string;
  messageType?: 'text' | 'file' | 'image' | 'system';
  attachments?: Array<{
    url: string;
    publicId?: string;
    fileName?: string;
    fileType?: string;
    fileSize?: number;
  }>;
}

export interface SearchUsersParams {
  q: string;
  role?: 'student' | 'instructor' | 'org_admin' | 'super_admin';
  limit?: number;
}

export interface UserSearchResult {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
}

// RTK Query API
export const messageApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all conversations
    getConversations: builder.query<ConversationListResponse, {
      includeArchived?: boolean;
      limit?: number;
      page?: number;
    }>({
      query: (params) => ({
        url: '/messages/conversations',
        params
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ _id }) => ({ type: 'Message' as const, id: `conversation-${_id}` })),
              { type: 'Message', id: 'CONVERSATION_LIST' }
            ]
          : [{ type: 'Message', id: 'CONVERSATION_LIST' }]
    }),

    // Get or create a conversation with a user
    getOrCreateConversation: builder.query<BaseApiResponse<{ conversation: Conversation }>, string>({
      query: (userId) => `/messages/conversations/${userId}`,
      providesTags: (result, error, userId) => [
        { type: 'Message', id: `user-conversation-${userId}` }
      ]
    }),

    // Get messages for a conversation
    getMessages: builder.query<MessagesListResponse, {
      conversationId: string;
      limit?: number;
      page?: number;
      before?: string;
    }>({
      query: ({ conversationId, ...params }) => ({
        url: `/messages/conversations/${conversationId}/messages`,
        params
      }),
      // Merge messages for infinite scroll
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        return `${endpointName}-${queryArgs.conversationId}`;
      },
      merge: (currentCache, newItems, { arg }) => {
        // If it's page 1, replace the cache
        if (!arg.page || arg.page === 1) {
          return newItems;
        }
        // Otherwise, append new messages
        return {
          ...newItems,
          data: [...currentCache.data, ...newItems.data]
        };
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg !== previousArg;
      },
      providesTags: (result, error, { conversationId }) => [
        { type: 'Message', id: `messages-${conversationId}` }
      ]
    }),

    // Send a message
    sendMessage: builder.mutation<BaseApiResponse<{ message: Message; conversationId: string }>, SendMessageRequest>({
      query: (data) => ({
        url: '/messages',
        method: 'POST',
        body: data
      }),
      invalidatesTags: (result) =>
        result
          ? [
              { type: 'Message', id: 'CONVERSATION_LIST' },
              { type: 'Message', id: `messages-${result.data.conversationId}` },
              { type: 'Message', id: `conversation-${result.data.conversationId}` }
            ]
          : []
    }),

    // Mark messages as read
    markAsRead: builder.mutation<BaseApiResponse<{ message: string }>, string>({
      query: (conversationId) => ({
        url: `/messages/conversations/${conversationId}/read`,
        method: 'PATCH'
      }),
      invalidatesTags: (result, error, conversationId) => [
        { type: 'Message', id: `messages-${conversationId}` },
        { type: 'Message', id: `conversation-${conversationId}` },
        { type: 'Message', id: 'CONVERSATION_LIST' },
        { type: 'Message', id: 'UNREAD_COUNT' }
      ]
    }),

    // Delete a message
    deleteMessage: builder.mutation<BaseApiResponse<{ message: string }>, string>({
      query: (messageId) => ({
        url: `/messages/${messageId}`,
        method: 'DELETE'
      }),
      invalidatesTags: [
        { type: 'Message', id: 'CONVERSATION_LIST' }
      ]
    }),

    // Search users
    searchUsers: builder.query<BaseApiResponse<UserSearchResult[]>, SearchUsersParams>({
      query: (params) => ({
        url: '/messages/users/search',
        params
      }),
      providesTags: [{ type: 'User', id: 'SEARCH' }]
    }),

    // Get unread count
    getUnreadCount: builder.query<BaseApiResponse<{ unreadCount: number }>, void>({
      query: () => '/messages/unread-count',
      providesTags: [{ type: 'Message', id: 'UNREAD_COUNT' }]
    }),

    // Archive conversation
    archiveConversation: builder.mutation<BaseApiResponse<{ message: string }>, string>({
      query: (conversationId) => ({
        url: `/messages/conversations/${conversationId}/archive`,
        method: 'PATCH'
      }),
      invalidatesTags: (result, error, conversationId) => [
        { type: 'Message', id: `conversation-${conversationId}` },
        { type: 'Message', id: 'CONVERSATION_LIST' }
      ]
    }),

    // Unarchive conversation
    unarchiveConversation: builder.mutation<BaseApiResponse<{ message: string }>, string>({
      query: (conversationId) => ({
        url: `/messages/conversations/${conversationId}/unarchive`,
        method: 'PATCH'
      }),
      invalidatesTags: (result, error, conversationId) => [
        { type: 'Message', id: `conversation-${conversationId}` },
        { type: 'Message', id: 'CONVERSATION_LIST' }
      ]
    })
  })
});

export const {
  useGetConversationsQuery,
  useGetOrCreateConversationQuery,
  useLazyGetOrCreateConversationQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
  useMarkAsReadMutation,
  useDeleteMessageMutation,
  useSearchUsersQuery,
  useLazySearchUsersQuery,
  useGetUnreadCountQuery,
  useArchiveConversationMutation,
  useUnarchiveConversationMutation
} = messageApi;
