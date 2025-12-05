'use client';

import { useCheckCertificateAvailabilityQuery, useGenerateCertificateMutation, downloadCertificateBlob } from '@/store/api/certificateApi';
import { Award, Download, Lock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/toast-utils';

interface CertificateDownloadButtonProps {
  enrollmentId: string;
  courseName?: string;
  variant?: 'default' | 'compact' | 'card';
}

export default function CertificateDownloadButton({
  enrollmentId,
  courseName,
  variant = 'default'
}: CertificateDownloadButtonProps) {
  const { data: availability, isLoading: checkingAvailability } = useCheckCertificateAvailabilityQuery(enrollmentId);
  const [generateCertificate, { isLoading: isGenerating }] = useGenerateCertificateMutation();

  const handleDownload = async () => {
    try {
      const blob = await generateCertificate(enrollmentId).unwrap();
      const filename = `Certificate-${availability?.data?.certificateId || 'Course'}.pdf`;
      downloadCertificateBlob(blob, filename);
      toast.success('Certificate downloaded successfully!');
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Failed to download certificate'));
    }
  };

  if (checkingAvailability) {
    return (
      <div className="flex items-center gap-2 text-gray-500">
        <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm">Checking certificate...</span>
      </div>
    );
  }

  const isAvailable = availability?.data?.isAvailable;
  const progress = availability?.data?.progress || 0;

  // Compact variant - just an icon button
  if (variant === 'compact') {
    if (!isAvailable) {
      return (
        <button
          disabled
          className="p-2 text-gray-400 cursor-not-allowed"
          title={`Course ${progress}% complete`}
        >
          <Lock className="w-5 h-5" />
        </button>
      );
    }

    return (
      <button
        onClick={handleDownload}
        disabled={isGenerating}
        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition disabled:opacity-50"
        title="Download Certificate"
      >
        {isGenerating ? (
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <Award className="w-5 h-5" />
        )}
      </button>
    );
  }

  // Card variant - larger card style
  if (variant === 'card') {
    if (!isAvailable) {
      return (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Lock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 mb-1">Certificate Locked</h3>
          <p className="text-sm text-gray-600 mb-2">
            Complete the course to earn your certificate
          </p>
          <div className="text-sm text-gray-500">
            Progress: {progress}%
          </div>
        </div>
      );
    }

    return (
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-gray-900">Certificate Available!</h3>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-sm text-gray-600 mb-4">
              {`Congratulations! You've earned a certificate for ${courseName || 'this course'}`}.
            </p>
            <button
              onClick={handleDownload}
              disabled={isGenerating}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isGenerating ? 'Generating...' : 'Download Certificate'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Default variant - standard button
  if (!isAvailable) {
    return (
      <button
        disabled
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed"
        title={`Complete the course to earn your certificate (${progress}% complete)`}
      >
        <Lock className="w-5 h-5" />
        <span>Certificate Locked</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleDownload}
      disabled={isGenerating}
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
    >
      <Award className="w-5 h-5" />
      <span>{isGenerating ? 'Generating Certificate...' : 'Download Certificate'}</span>
    </button>
  );
}
