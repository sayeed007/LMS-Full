import { baseApi, BaseApiResponse } from './baseApi';

export interface PaymentData {
  gatewayUrl: string;
  transactionId: string;
  sessionKey: string;
}

export interface PaymentDetails {
  amount: number;
  currency: string;
  paymentMethod?: string;
  transactionId?: string;
  paidAt?: string;
  refunded?: boolean;
  refundedAt?: string;
  refundReason?: string;
}

export interface PaymentHistoryItem {
  enrollmentId: string;
  course: {
    _id: string;
    title: string;
    thumbnail?: string;
    instructor?: string;
  };
  payment: PaymentDetails;
  enrolledAt: string;
}

export interface PaymentHistoryResponse {
  payments: PaymentHistoryItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const paymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Initiate payment
    initiatePayment: builder.mutation<BaseApiResponse<PaymentData>, { courseId: string }>({
      query: (data) => ({
        url: '/payments/initiate',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Payment'],
    }),

    // Verify payment
    verifyPayment: builder.query<BaseApiResponse<{ verified: boolean; payment?: PaymentDetails }>, string>({
      query: (transactionId) => `/payments/verify/${transactionId}`,
      providesTags: ['Payment'],
    }),

    // Get payment history
    getPaymentHistory: builder.query<BaseApiResponse<PaymentHistoryResponse>, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 10 }) => `/payments/history?page=${page}&limit=${limit}`,
      providesTags: ['Payment'],
    }),

    // Refund payment (Admin only)
    refundPayment: builder.mutation<BaseApiResponse<{ message: string; refund: PaymentDetails }>, { enrollmentId: string; reason: string }>({
      query: ({ enrollmentId, reason }) => ({
        url: `/payments/refund/${enrollmentId}`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: ['Payment', 'Enrollment'],
    }),
  }),
});

export const {
  useInitiatePaymentMutation,
  useVerifyPaymentQuery,
  useGetPaymentHistoryQuery,
  useRefundPaymentMutation,
} = paymentApi;
