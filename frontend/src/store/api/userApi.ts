import { baseApi, BaseApiResponse } from './baseApi';
import { User } from '../../types/backend-models';

// API-specific interfaces for populated users
export interface UserPopulated extends Omit<User, 'organization'> {
  organization?: {
    _id: string;
    name: string;
    slug: string;
  };
}

export interface UpdateProfileRequest {
  name?: string;
  bio?: string;
  avatar?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  address?: User['address'];
  socialLinks?: User['socialLinks'];
  skills?: string[];
  interests?: string[];
}

export interface UpdatePreferencesRequest {
  preferences: Partial<User['preferences']>;
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
  name: string;
  email: string;
  password?: string;
  role?: User['role'];
  avatar?: string;
  bio?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  address?: User['address'];
  socialLinks?: User['socialLinks'];
  skills?: string[];
  interests?: string[];
  preferences?: Partial<User['preferences']>;
  organization?: string;
}

export interface UpdateUserRequest extends Partial<CreateUserRequest> {
  isActive?: boolean;
  emailVerified?: boolean;
  twoFactorEnabled?: boolean;
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
    getUsers: builder.query<BaseApiResponse<UserPopulated[]>, UserListParams | void>({
      query: (params) => ({
        url: '/users',
        params,
      }),
      providesTags: ['User'],
    }),

    getUserById: builder.query<BaseApiResponse<{ user: UserPopulated }>, string>({
      query: (id) => `/users/${id}`,
      providesTags: (result, error, id) => [{ type: 'User', id }],
    }),

    updateProfile: builder.mutation<BaseApiResponse<{ user: UserPopulated }>, UpdateProfileRequest>({
      query: (data) => ({
        url: '/users/profile',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['User', 'Auth'],
    }),

    updatePreferences: builder.mutation<BaseApiResponse<{ user: UserPopulated }>, UpdatePreferencesRequest>({
      query: (data) => ({
        url: '/users/preferences',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['User', 'Auth'],
    }),

    uploadAvatar: builder.mutation<BaseApiResponse<{ user: UserPopulated }>, FormData>({
      query: (formData) => ({
        url: '/users/avatar',
        method: 'POST',
        body: formData,
        formData: true,
      }),
      invalidatesTags: ['User', 'Auth'],
    }),

    deleteAvatar: builder.mutation<BaseApiResponse<{ user: UserPopulated }>, void>({
      query: () => ({
        url: '/users/avatar',
        method: 'DELETE',
      }),
      invalidatesTags: ['User', 'Auth'],
    }),

    // Admin only endpoints
    createUser: builder.mutation<BaseApiResponse<{ user: UserPopulated }>, CreateUserRequest>({
      query: (data) => ({
        url: '/users',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    updateUser: builder.mutation<BaseApiResponse<{ user: UserPopulated }>, { id: string; data: UpdateUserRequest }>({
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