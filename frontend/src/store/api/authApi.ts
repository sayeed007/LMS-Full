import { baseApi, BaseApiResponse } from './baseApi';
import { User } from '../../types/backend-models';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
  role?: User['role'];
  organization?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  passwordConfirm: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  password: string;
  passwordConfirm: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<BaseApiResponse<LoginResponse>, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth'],
    }),

    register: builder.mutation<BaseApiResponse<LoginResponse>, RegisterRequest>({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
    }),

    forgotPassword: builder.mutation<BaseApiResponse<{ message: string }>, ForgotPasswordRequest>({
      query: (data) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body: data,
      }),
    }),

    resetPassword: builder.mutation<BaseApiResponse<LoginResponse>, ResetPasswordRequest>({
      query: (data) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body: data,
      }),
    }),

    changePassword: builder.mutation<BaseApiResponse<{ message: string }>, ChangePasswordRequest>({
      query: (data) => ({
        url: '/auth/change-password',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Auth'],
    }),

    verifyEmail: builder.mutation<BaseApiResponse<{ message: string }>, VerifyEmailRequest>({
      query: (data) => ({
        url: '/auth/verify-email',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Auth'],
    }),

    resendVerification: builder.mutation<BaseApiResponse<{ message: string }>, void>({
      query: () => ({
        url: '/auth/resend-verification',
        method: 'POST',
      }),
    }),

    refreshToken: builder.mutation<BaseApiResponse<LoginResponse>, void>({
      query: () => ({
        url: '/auth/refresh-token',
        method: 'POST',
      }),
      invalidatesTags: ['Auth'],
    }),

    logout: builder.mutation<BaseApiResponse<{ message: string }>, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['Auth'],
    }),

    getMe: builder.query<BaseApiResponse<{ user: User }>, void>({
      query: () => '/auth/me',
      providesTags: ['Auth'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useVerifyEmailMutation,
  useResendVerificationMutation,
  useRefreshTokenMutation,
  useLogoutMutation,
  useGetMeQuery,
} = authApi;