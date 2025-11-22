'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const enrollmentId = searchParams.get('enrollment');
  const courseId = searchParams.get('course');

  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (courseId) {
            router.push(`/courses/${courseId}/learn`);
          } else {
            router.push('/dashboard');
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [courseId, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-2xl w-full bg-white shadow-2xl rounded-2xl p-12">
        <div className="text-center">
          <div className="mb-6 inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full">
            <CheckCircle className="w-16 h-16 text-green-600" />
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Payment Successful!
          </h1>

          <p className="text-xl text-gray-600 mb-8">
            Thank you for your purchase. You are now enrolled in the course.
          </p>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-green-900 mb-2">
              What happens next?
            </h2>
            <ul className="text-left text-green-800 space-y-2">
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>You will receive a confirmation email shortly</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Access your course immediately from your dashboard</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Start learning at your own pace</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            {courseId && (
              <Link
                href={`/courses/${courseId}/learn`}
                className="block w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Start Learning Now
              </Link>
            )}

            <Link
              href="/dashboard"
              className="block w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>

          <p className="mt-8 text-sm text-gray-500">
            Redirecting automatically in {countdown} seconds...
          </p>
        </div>
      </div>
    </div>
  );
}
