import { createApi, fetchBaseQuery, type BaseQueryFn, type FetchArgs, type FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../index';
import { setCredentials, logout } from '../slices/authSlice';

// Create base query with auth headers
const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1',
  prepareHeaders: (headers, { getState, endpoint }) => {
    // Get token from Redux state (synced by SessionSync component)
    const token = (getState() as RootState).auth.token;

    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }

    // Don't set Content-Type for file uploads - let browser set multipart boundary
    const isFileUpload = endpoint === 'uploadFileToCloudinary' ||
                        endpoint === 'uploadImage' ||
                        endpoint === 'uploadDocument' ||
                        endpoint === 'uploadVideo' ||
                        endpoint === 'uploadAudio' ||
                        endpoint === 'bulkUpload' ||
                        endpoint === 'upload';

    if (!isFileUpload) {
      headers.set('Content-Type', 'application/json');
    }

    return headers;
  },
  credentials: 'include', // Important: Include cookies for refresh token
});

// Create base query with automatic token refresh
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  // If we get a 401 error, the token might be expired
  // NextAuth handles token refresh automatically, but we need to handle the case
  // where NextAuth hasn't refreshed yet or refresh failed
  if (result.error && result.error.status === 401) {
    console.log('Received 401 error - token may be expired');

    // Check if this is a refresh token request itself to avoid infinite loop
    const url = typeof args === 'string' ? args : args.url;
    if (url.includes('/auth/refresh-token')) {
      console.log('Refresh token request failed - user needs to re-authenticate');
      api.dispatch(logout());
      return result;
    }

    // Get current state
    const state = api.getState() as RootState;
    const refreshToken = state.auth.refreshToken;

    if (!refreshToken) {
      console.log('No refresh token available - logging out');
      api.dispatch(logout());
      return result;
    }

    console.log('Attempting to refresh token...');

    // Try to refresh the token
    const refreshResult = await baseQuery(
      {
        url: '/auth/refresh-token',
        method: 'POST',
        body: { refreshToken }
      },
      api,
      extraOptions
    );

    if (refreshResult.data) {
      const data = refreshResult.data as {
        status: string;
        token?: string;
        refreshToken?: string;
        data?: { token: string; refreshToken: string; user: any }
      };

      // Handle response format
      const newToken = data.token || data.data?.token;
      const newRefreshToken = data.refreshToken || data.data?.refreshToken;
      const user = data.data?.user;

      if (newToken && user) {
        // Update Redux with new tokens
        api.dispatch(setCredentials({
          user: user,
          token: newToken,
          refreshToken: newRefreshToken,
        }));

        console.log('Token refreshed successfully, retrying original request');

        // Retry the original query with new token
        result = await baseQuery(args, api, extraOptions);
      } else {
        console.log('Token refresh failed - invalid response format');
        api.dispatch(logout());
      }
    } else {
      console.log('Token refresh failed - logging out');
      api.dispatch(logout());
    }
  }

  return result;
};

// Base API configuration
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'User',
    'Course',
    'Lesson',
    'Chapter',
    'Content',
    'Enrollment',
    'Progress',
    'Organization',
    'Article',
    'Auth',
    'QuestionBank',
    'QuestionBanks',
    'Question',
    'Questions',
    'Quiz',
    'Category',
    'Categories',
    'Upload',
    'Payment',
    'Assignment',
    'Message',
    'Certificate',
    'Setting'
  ],
  endpoints: () => ({}),
});

export type BaseApiResponse<T> = {
  status: string;
  message?: string;
  data?: T;
  results?: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

export type ApiError = {
  status: string;
  message: string;
  errors?: Record<string, string[]>;
};