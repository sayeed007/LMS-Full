import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../index';

// Base API configuration
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
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
  }),
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
    'Payment'
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