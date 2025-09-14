import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../index';

// Base API configuration
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
    prepareHeaders: (headers, { getState }) => {
      // Get token from the auth state
      const token = (getState() as RootState).auth.token;
      
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: [
    'User', 
    'Course', 
    'Lesson', 
    'Enrollment', 
    'Progress', 
    'Organization', 
    'Article',
    'Auth'
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