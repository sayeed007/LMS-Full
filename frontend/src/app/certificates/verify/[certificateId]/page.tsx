'use client';

import { useParams } from 'next/navigation';
import { useGetCertificateByIdQuery, useDownloadCertificateMutation, downloadCertificateBlob } from '@/store/api/certificateApi';
import { Award, Download, CheckCircle, XCircle, Calendar, User, BookOpen, TrendingUp, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/toast-utils';
import { format } from 'date-fns';
import Link from 'next/link';

export default function VerifyCertificatePage() {
  const params = useParams();
  const certificateId = params.certificateId as string;

  const { data, isLoading, error } = useGetCertificateByIdQuery(certificateId);
  const [downloadCertificate, { isLoading: isDownloading }] = useDownloadCertificateMutation();

  const certificate = data?.data?.certificate;

  const handleDownload = async () => {
    try {
      const blob = await downloadCertificate(certificateId).unwrap();
      downloadCertificateBlob(blob, `Certificate-${certificateId}.pdf`);
      toast.success('Certificate downloaded successfully');
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Failed to download certificate'));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 mt-4">Verifying certificate...</p>
        </div>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Certificate Not Found</h2>
          <p className="text-gray-600 mb-6">
            The certificate ID you provided could not be verified. Please check the ID and try again.
          </p>
          <Link
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Verification Status */}
        <div className={`rounded-lg p-6 mb-8 ${certificate.isRevoked ? 'bg-red-50 border-2 border-red-200' : 'bg-green-50 border-2 border-green-200'}`}>
          <div className="flex items-center gap-4">
            {certificate.isRevoked ? (
              <>
                <XCircle className="w-12 h-12 text-red-600 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold text-red-900 mb-1">Certificate Revoked</h2>
                  <p className="text-red-700">
                    This certificate has been revoked and is no longer valid.
                  </p>
                  {certificate.revokeReason && (
                    <p className="text-red-600 text-sm mt-2">
                      Reason: {certificate.revokeReason}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <>
                <CheckCircle className="w-12 h-12 text-green-600 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold text-green-900 mb-1">Certificate Verified</h2>
                  <p className="text-green-700">
                    This is a valid certificate issued by our Learning Management System.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Certificate Details */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
            <div className="flex items-center gap-4 mb-4">
              <Award className="w-16 h-16" />
              <div>
                <h1 className="text-3xl font-bold">Certificate of Achievement</h1>
                <p className="text-blue-100">Official Verification Page</p>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <DetailItem
                icon={<User className="w-5 h-5" />}
                label="Student Name"
                value={certificate.studentName}
              />
              <DetailItem
                icon={<BookOpen className="w-5 h-5" />}
                label="Course Name"
                value={certificate.courseName}
              />
              <DetailItem
                icon={<Calendar className="w-5 h-5" />}
                label="Completion Date"
                value={format(new Date(certificate.completionDate), 'MMMM dd, yyyy')}
              />
              <DetailItem
                icon={<User className="w-5 h-5" />}
                label="Instructor"
                value={certificate.instructorName}
              />
              {certificate.finalScore !== null && certificate.finalScore !== undefined && (
                <DetailItem
                  icon={<TrendingUp className="w-5 h-5" />}
                  label="Final Score"
                  value={`${certificate.finalScore}%`}
                />
              )}
              <DetailItem
                icon={<Shield className="w-5 h-5" />}
                label="Certificate ID"
                value={certificate.certificateId}
                mono
              />
              <DetailItem
                icon={<Calendar className="w-5 h-5" />}
                label="Issued On"
                value={format(new Date(certificate.createdAt), 'MMMM dd, yyyy')}
              />
            </div>

            {/* Download Button */}
            {!certificate.isRevoked && (
              <div className="border-t pt-6">
                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="w-full md:w-auto flex items-center justify-center gap-3 bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
                >
                  <Download className="w-6 h-6" />
                  <span>{isDownloading ? 'Downloading...' : 'Download Certificate PDF'}</span>
                </button>
              </div>
            )}

            {/* Revocation Details */}
            {certificate.isRevoked && certificate.revokedAt && (
              <div className="border-t pt-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-semibold text-red-900 mb-2">Revocation Details</h3>
                  <p className="text-red-700 text-sm">
                    Revoked on: {format(new Date(certificate.revokedAt), 'MMMM dd, yyyy')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Verification Notice */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Verification Information
          </h3>
          <p className="text-blue-800 text-sm">
            This certificate can be verified at any time by visiting this URL. The certificate ID serves as a unique identifier for authentication purposes. If you have concerns about the validity of this certificate, please contact the issuing institution.
          </p>
        </div>
      </div>
    </div>
  );
}

// Helper Component
function DetailItem({
  icon,
  label,
  value,
  mono = false
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-blue-600 mt-1">{icon}</div>
      <div className="flex-1">
        <div className="text-sm text-gray-500 mb-1">{label}</div>
        <div className={`font-semibold text-gray-900 ${mono ? 'font-mono text-sm' : ''}`}>
          {value}
        </div>
      </div>
    </div>
  );
}
