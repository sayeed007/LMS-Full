import { baseApi, BaseApiResponse } from './baseApi';

export interface FileMetadata {
  _id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  url: string;
  uploadedBy: string;
  category: 'image' | 'document' | 'video' | 'audio' | 'other';
  isPublic: boolean;
  tags: string[];
  uploadedAt: string;
}

export interface UploadResponse {
  filename: string;
  url: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
}

export interface FileListParams {
  page?: number;
  limit?: number;
  category?: 'image' | 'document' | 'video' | 'audio' | 'other';
  courseId?: string;
  tags?: string;
}

export interface BulkUploadResponse {
  successful: UploadResponse[];
  failed: Array<{
    filename: string;
    error: string;
  }>;
}

export const uploadApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    uploadImage: builder.mutation<BaseApiResponse<UploadResponse>, FormData>({
      query: (formData) => ({
        url: '/upload/image',
        method: 'POST',
        body: formData,
        formData: true,
      }),
      invalidatesTags: ['Upload'],
    }),

    uploadDocument: builder.mutation<BaseApiResponse<UploadResponse>, FormData>({
      query: (formData) => ({
        url: '/upload/document',
        method: 'POST',
        body: formData,
        formData: true,
      }),
      invalidatesTags: ['Upload'],
    }),

    uploadVideo: builder.mutation<BaseApiResponse<UploadResponse>, FormData>({
      query: (formData) => ({
        url: '/upload/video',
        method: 'POST',
        body: formData,
        formData: true,
      }),
      invalidatesTags: ['Upload'],
    }),

    uploadAudio: builder.mutation<BaseApiResponse<UploadResponse>, FormData>({
      query: (formData) => ({
        url: '/upload/audio',
        method: 'POST',
        body: formData,
        formData: true,
      }),
      invalidatesTags: ['Upload'],
    }),

    bulkUpload: builder.mutation<BaseApiResponse<BulkUploadResponse>, FormData>({
      query: (formData) => ({
        url: '/upload/bulk',
        method: 'POST',
        body: formData,
        formData: true,
      }),
      invalidatesTags: ['Upload'],
    }),

    getFiles: builder.query<BaseApiResponse<FileMetadata[]>, FileListParams | void>({
      query: (params) => ({
        url: '/upload/files',
        params,
      }),
      providesTags: ['Upload'],
    }),

    getFileById: builder.query<BaseApiResponse<FileMetadata>, string>({
      query: (id) => `/upload/files/${id}`,
      providesTags: (result, error, id) => [{ type: 'Upload', id }],
    }),

    deleteFile: builder.mutation<BaseApiResponse<void>, string>({
      query: (id) => ({
        url: `/upload/files/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Upload', id }, 'Upload'],
    }),

    // Generic upload for backward compatibility
    upload: builder.mutation<BaseApiResponse<UploadResponse>, FormData>({
      query: (formData) => ({
        url: '/upload',
        method: 'POST',
        body: formData,
        formData: true,
      }),
      invalidatesTags: ['Upload'],
    }),
  }),
});

export const {
  useUploadImageMutation,
  useUploadDocumentMutation,
  useUploadVideoMutation,
  useUploadAudioMutation,
  useBulkUploadMutation,
  useGetFilesQuery,
  useGetFileByIdQuery,
  useDeleteFileMutation,
  useUploadMutation,
} = uploadApi;