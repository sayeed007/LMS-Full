import { baseApi, BaseApiResponse } from './baseApi';

export interface Certificate {
  _id: string;
  certificateId: string;
  student: string;
  course: string | {
    _id: string;
    title: string;
    thumbnail?: string;
  };
  enrollment: string;
  completionDate: string;
  finalScore?: number;
  instructorName: string;
  courseName: string;
  studentName: string;
  isRevoked: boolean;
  revokedAt?: string;
  revokeReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CertificateAvailability {
  isAvailable: boolean;
  certificateExists: boolean;
  certificateId: string | null;
  progress: number;
  completedAt: string | null;
}

export interface RevokeCertificateRequest {
  reason: string;
}

export const certificateApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Generate and download certificate
    generateCertificate: builder.mutation<Blob, string>({
      query: (enrollmentId) => ({
        url: `/certificates/generate/${enrollmentId}`,
        method: 'GET',
        responseHandler: async (response) => {
          return await response.blob();
        },
      }),
      invalidatesTags: ['Certificate'],
    }),

    // Get certificate details (for verification)
    getCertificateById: builder.query<BaseApiResponse<{ certificate: Certificate }>, string>({
      query: (certificateId) => `/certificates/${certificateId}`,
      providesTags: (result, error, id) => [{ type: 'Certificate', id }],
    }),

    // Get my certificates
    getMyCertificates: builder.query<BaseApiResponse<Certificate[]>, { page?: number; limit?: number } | void>({
      query: (params) => ({
        url: '/certificates/student/my-certificates',
        params: params || {},
      }),
      providesTags: ['Certificate'],
    }),

    // Get course certificates (instructor/admin)
    getCourseCertificates: builder.query<
      BaseApiResponse<Certificate[]>,
      { courseId: string; params?: { page?: number; limit?: number } }
    >({
      query: ({ courseId, params }) => ({
        url: `/certificates/course/${courseId}`,
        params,
      }),
      providesTags: (result, error, { courseId }) => [{ type: 'Certificate', id: `course-${courseId}` }],
    }),

    // Revoke certificate (admin only)
    revokeCertificate: builder.mutation<
      BaseApiResponse<{ message: string; certificate: Certificate }>,
      { certificateId: string; data: RevokeCertificateRequest }
    >({
      query: ({ certificateId, data }) => ({
        url: `/certificates/${certificateId}/revoke`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { certificateId }) => [
        { type: 'Certificate', id: certificateId },
        'Certificate',
      ],
    }),

    // Download certificate by ID
    downloadCertificate: builder.mutation<Blob, string>({
      query: (certificateId) => ({
        url: `/certificates/${certificateId}/download`,
        method: 'GET',
        responseHandler: async (response) => {
          return await response.blob();
        },
      }),
    }),

    // Check certificate availability
    checkCertificateAvailability: builder.query<
      BaseApiResponse<CertificateAvailability>,
      string
    >({
      query: (enrollmentId) => `/certificates/check/${enrollmentId}`,
      providesTags: (result, error, id) => [{ type: 'Certificate', id: `check-${id}` }],
    }),
  }),
});

export const {
  useGenerateCertificateMutation,
  useGetCertificateByIdQuery,
  useGetMyCertificatesQuery,
  useGetCourseCertificatesQuery,
  useRevokeCertificateMutation,
  useDownloadCertificateMutation,
  useCheckCertificateAvailabilityQuery,
} = certificateApi;

// Helper function to download certificate blob
export const downloadCertificateBlob = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
