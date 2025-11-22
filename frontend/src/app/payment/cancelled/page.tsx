'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Ban } from 'lucide-react';

export default function PaymentCancelledPage() {
  const searchParams = useSearchParams();
  const courseId = searchParams.get('course');
  const transactionId = searchParams.get('transaction');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-yellow-50">
      <div className="max-w-2xl w-full bg-white shadow-2xl rounded-2xl p-12">
        <div className="text-center">
          <div className="mb-6 inline-flex items-center justify-center w-24 h-24 bg-yellow-100 rounded-full">
            <Ban className="w-16 h-16 text-yellow-600" />
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Payment Cancelled
          </h1>

          <p className="text-xl text-gray-600 mb-4">
            You have cancelled the payment process.
          </p>

          {transactionId && (
            <p className="text-sm text-gray-500 mb-8">
              Transaction ID: {transactionId}
            </p>
          )}

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <p className="text-yellow-900">
              No charges have been made to your account. You can try again when you're ready.
            </p>
          </div>

          <div className="space-y-4">
            {courseId && (
              <Link
                href={`/payment/checkout?courseId=${courseId}`}
                className="block w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Complete Payment
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
        </div>
      </div>
    </div>
  );
}
