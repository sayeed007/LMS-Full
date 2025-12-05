'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useInitiatePaymentMutation } from '@/store/api/paymentApi';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/toast-utils';

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get('courseId');

  const [initiatePayment, { isLoading }] = useInitiatePaymentMutation();
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    if (!courseId) {
      toast.error('Course ID is missing');
      router.push('/courses');
      return;
    }

    // Auto-initiate payment on page load
    handleInitiatePayment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const handleInitiatePayment = async () => {
    if (!courseId) return;

    try {
      setProcessingPayment(true);
      const response = await initiatePayment({ courseId }).unwrap();

      if (response.status === 'success' && response.data?.gatewayUrl) {
        // Redirect to payment gateway
        window.location.href = response.data.gatewayUrl;
      } else {
        toast.error('Failed to initiate payment');
        router.push(`/courses/${courseId}`);
      }
    } catch (error: unknown) {
      console.error('Payment initiation error:', error);
      toast.error(getErrorMessage(error, 'Failed to initiate payment'));
      router.push(`/courses/${courseId}`);
    } finally {
      setProcessingPayment(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
        <div className="text-center">
          <div className="mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {processingPayment || isLoading ? 'Processing Payment...' : 'Redirecting to Payment Gateway...'}
          </h1>
          <p className="text-gray-600 mb-6">
            Please wait while we redirect you to the secure payment gateway.
          </p>
          <p className="text-sm text-gray-500">
            Do not close this window or refresh the page.
          </p>
        </div>
      </div>
    </div>
  );
}
