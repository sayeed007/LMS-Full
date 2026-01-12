"use client";

import { useState } from "react";
import {
  useGetMyCertificatesQuery,
  useDownloadCertificateMutation,
  downloadCertificateBlob,
  type Certificate,
} from "@/store/api/certificateApi";
import {
  Award,
  Download,
  Eye,
  Calendar,
  TrendingUp,
  FileCheck,
} from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/toast-utils";
import { format } from "date-fns";
import Link from "next/link";
import Image from "next/image";
import { Pagination } from "@/components/ui";

export default function MyCertificatesPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);

  const { data, isLoading, error } = useGetMyCertificatesQuery({ page, limit });
  const [downloadCertificate, { isLoading: isDownloading }] =
    useDownloadCertificateMutation();

  const handleDownload = async (certificateId: string) => {
    try {
      const blob = await downloadCertificate(certificateId).unwrap();
      downloadCertificateBlob(blob, `Certificate-${certificateId}.pdf`);
      toast.success("Certificate downloaded successfully");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to download certificate"));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Award className="w-10 h-10 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">
              My Certificates
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            View and download your course completion certificates
          </p>
        </div>

        {/* Stats Card */}
        {data && data.pagination && (
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm opacity-90 mb-1">
                  Total Certificates Earned
                </div>
                <div className="text-4xl font-bold">
                  {data.pagination.totalResults}
                </div>
              </div>
              <FileCheck className="w-16 h-16 opacity-30" />
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600 mt-4">Loading certificates...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600">Error loading certificates</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && (!data?.data || data.data.length === 0) && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Award className="w-20 h-20 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Certificates Yet
            </h3>
            <p className="text-gray-600 mb-6">
              Complete courses to earn certificates that showcase your
              achievements.
            </p>
            <Link
              href="/courses"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Browse Courses
            </Link>
          </div>
        )}

        {/* Certificates Grid */}
        {!isLoading && data?.data && data.data.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.data.map((certificate: Certificate) => (
                <div
                  key={certificate._id}
                  className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden border border-gray-200"
                >
                  {/* Course Thumbnail */}
                  <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
                    {typeof certificate.course === "object" &&
                    certificate.course?.thumbnail ? (
                      <Image
                        src={certificate.course.thumbnail}
                        alt={certificate.courseName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Award className="w-16 h-16 text-white opacity-50" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-blue-600">
                      Completed
                    </div>
                  </div>

                  {/* Certificate Details */}
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                      {certificate.courseName}
                    </h3>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Completed:{" "}
                          {format(
                            new Date(certificate.completionDate),
                            "MMM dd, yyyy"
                          )}
                        </span>
                      </div>

                      {certificate.finalScore !== null &&
                        certificate.finalScore !== undefined && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <TrendingUp className="w-4 h-4" />
                            <span>Score: {certificate.finalScore}%</span>
                          </div>
                        )}

                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FileCheck className="w-4 h-4" />
                        <span className="font-mono text-xs">
                          {certificate.certificateId}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          handleDownload(certificate.certificateId)
                        }
                        disabled={isDownloading}
                        className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Download className="w-4 h-4" />
                        <span className="font-medium">Download</span>
                      </button>
                      <Link
                        href={`/certificates/verify/${certificate.certificateId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition"
                        title="View Certificate"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {data.pagination && data.pagination.totalPages > 0 && (
              <div className="mt-8">
                <Pagination
                  currentPage={page}
                  totalPages={data.pagination.totalPages}
                  totalItems={data.pagination.totalResults}
                  itemsPerPage={limit}
                  onPageChange={(newPage) => setPage(newPage)}
                  onPageSizeChange={(newSize) => {
                    setLimit(newSize);
                    setPage(1);
                  }}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
