'use client';

import { RefreshCw, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function PaymentFailedPage() {
  const searchParams = useSearchParams();
  const courseId = searchParams.get('course');
  const transactionId = searchParams.get('transaction');
  const reason = searchParams.get('reason');

  const getErrorMessage = () => {
    switch (reason) {
      case 'validation_failed':
        return 'Payment validation failed. Please try again.';
      case 'server_error':
        return 'A server error occurred. Please try again later.';
      default:
        return 'Your payment could not be processed. Please try again.';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
      <div className="max-w-2xl w-full bg-white shadow-2xl rounded-2xl p-12">
        <div className="text-center">
          <div className="mb-6 inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full">
            <XCircle className="w-16 h-16 text-red-600" />
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Payment Failed
          </h1>

          <p className="text-xl text-gray-600 mb-4">
            {getErrorMessage()}
          </p>

          {transactionId && (
            <p className="text-sm text-gray-500 mb-8">
              Transaction ID: {transactionId}
            </p>
          )}

          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-red-900 mb-2">
              Common reasons for payment failure:
            </h2>
            <ul className="text-left text-red-800 space-y-2">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Insufficient funds in your account</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Incorrect card details or expired card</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Bank declined the transaction</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Network connectivity issues</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            {courseId && (
              <Link
                href={`/payment/checkout?courseId=${courseId}`}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Try Again
              </Link>
            )}

            {courseId && (
              <Link
                href={`/courses/${courseId}`}
                className="block w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                Back to Course Details
              </Link>
            )}

            <Link
              href="/dashboard"
              className="block w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>

          <p className="mt-8 text-sm text-gray-500">
            Need help? <Link href="/support" className="text-blue-600 hover:underline">Contact Support</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
