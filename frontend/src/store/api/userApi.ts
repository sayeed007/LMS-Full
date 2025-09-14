import { baseApi, BaseApiResponse } from './baseApi';
import type { User } from '../slices/authSlice';

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  profile?: {
    avatar?: string;
    bio?: string;
    phone?: string;
    dateOfBirth?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      country?: string;
      zipCode?: string;
    };
  };
}

export interface UpdatePreferencesRequest {
  preferences: {
    language: string;
    timezone: string;
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
  };
}

export interface UserListParams {
  page?: number;
  limit?: number;
  role?: string;
  isActive?: boolean;
  search?: string;
  organization?: string;
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  passwordConfirm: string;
  role: 'student' | 'instructor' | 'org_admin' | 'super_admin';
  organization?: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  role?: 'student' | 'instructor' | 'org_admin' | 'super_admin';
  isActive?: boolean;
  organization?: string;
  profile?: {
    avatar?: string;
    bio?: string;
    phone?: string;
    dateOfBirth?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      country?: string;
      zipCode?: string;
    };
  };
}

export interface UserStatsResponse {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  usersByRole: {
    students: number;
    instructors: number;
    admins: number;
  };
}

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<BaseApiResponse<User[]>, UserListParams | void>({
      query: (params) => ({
        url: '/users',
        params,
      }),
      providesTags: ['User'],
    }),

    getUserById: builder.query<BaseApiResponse<{ user: User }>, string>({
      query: (id) => `/users/${id}`,
      providesTags: (result, error, id) => [{ type: 'User', id }],
    }),

    updateProfile: builder.mutation<BaseApiResponse<{ user: User }>, UpdateProfileRequest>({
      query: (data) => ({
        url: '/users/profile',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['User', 'Auth'],
    }),

    updatePreferences: builder.mutation<BaseApiResponse<{ user: User }>, UpdatePreferencesRequest>({
      query: (data) => ({
        url: '/users/preferences',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['User', 'Auth'],
    }),

    uploadAvatar: builder.mutation<BaseApiResponse<{ user: User }>, FormData>({
      query: (formData) => ({
        url: '/users/avatar',
        method: 'POST',
        body: formData,
        formData: true,
      }),
      invalidatesTags: ['User', 'Auth'],
    }),

    deleteAvatar: builder.mutation<BaseApiResponse<{ user: User }>, void>({
      query: () => ({
        url: '/users/avatar',
        method: 'DELETE',
      }),
      invalidatesTags: ['User', 'Auth'],
    }),

    // Admin only endpoints
    createUser: builder.mutation<BaseApiResponse<{ user: User }>, CreateUserRequest>({
      query: (data) => ({
        url: '/users',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    updateUser: builder.mutation<BaseApiResponse<{ user: User }>, { id: string; data: UpdateUserRequest }>({
      query: ({ id, data }) => ({
        url: `/users/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'User', id }, 'User'],
    }),

    deleteUser: builder.mutation<BaseApiResponse<void>, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'User', id }, 'User'],
    }),

    getUserStats: builder.query<BaseApiResponse<UserStatsResponse>, void>({
      query: () => '/users/stats',
      providesTags: ['User'],
    }),

    deactivateAccount: builder.mutation<BaseApiResponse<{ message: string }>, void>({
      query: () => ({
        url: '/users/deactivate',
        method: 'PATCH',
      }),
      invalidatesTags: ['User', 'Auth'],
    }),

    exportUsers: builder.query<Blob, { format: 'csv' | 'excel' } & UserListParams>({
      query: (params) => ({
        url: '/users/export',
        params,
        responseHandler: (response) => response.blob(),
      }),
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useUpdateProfileMutation,
  useUpdatePreferencesMutation,
  useUploadAvatarMutation,
  useDeleteAvatarMutation,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetUserStatsQuery,
  useDeactivateAccountMutation,
  useLazyExportUsersQuery,
} = userApi;