"use client";

import { getErrorMessage } from "@/lib/utils";
import {
  useApproveCourseMutation,
  useGetPendingCoursesQuery,
  useRejectCourseMutation,
  type CoursePopulated,
} from "@/store/api/courseApi";
import { Check, Clock, Eye, X } from "lucide-react";
import moment from "moment";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { useConfirm } from "@/hooks/useConfirm";
import { Container, Pagination } from "@/components/ui";

export default function PendingCoursesPage() {
  const confirm = useConfirm();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<CoursePopulated | null>(
    null
  );
  const [rejectionReason, setRejectionReason] = useState("");

  const { data, isLoading, refetch } = useGetPendingCoursesQuery({
    page,
    limit,
  });
  const [approveCourse, { isLoading: isApproving }] =
    useApproveCourseMutation();
  const [rejectCourse, { isLoading: isRejecting }] = useRejectCourseMutation();

  const handleApprove = async (courseId: string, courseTitle: string) => {
    const confirmed = await confirm({
      title: "Approve Course",
      message: `Are you sure you want to approve "${courseTitle}"?`,
      confirmText: "Approve",
      cancelText: "Cancel",
      variant: "info",
    });

    if (!confirmed) return;

    try {
      await approveCourse({ id: courseId }).unwrap();
      toast.success("Course approved successfully!");
      refetch();
    } catch (error: unknown) {
      console.error("Approval error:", error);
      toast.error(getErrorMessage(error, "Failed to approve course"));
    }
  };

  const openRejectModal = (course: CoursePopulated) => {
    setSelectedCourse(course);
    setRejectionReason("");
    setRejectModalOpen(true);
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    if (!selectedCourse) return;

    try {
      await rejectCourse({
        id: selectedCourse._id,
        reason: rejectionReason,
      }).unwrap();
      toast.success("Course rejected successfully");
      setRejectModalOpen(false);
      setSelectedCourse(null);
      setRejectionReason("");
      refetch();
    } catch (error: unknown) {
      console.error("Rejection error:", error);
      toast.error(getErrorMessage(error, "Failed to reject course"));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const courses = data?.data || [];
  const pagination = data?.pagination;

  return (
    <Container className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Pending Course Approvals
          </h1>
          <p className="text-gray-600 mt-2">
            Review and approve courses submitted by instructors
          </p>
        </div>

        {courses.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No pending courses
            </h3>
            <p className="text-gray-600">All courses have been reviewed</p>
          </div>
        ) : (
          <>
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Course
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Instructor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Submitted
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {courses.map((course: CoursePopulated) => (
                      <tr key={course._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-16 w-24">
                              {course.thumbnail ? (
                                <Image
                                  className="h-16 w-24 rounded object-cover"
                                  src={course.thumbnail}
                                  alt={course.title}
                                />
                              ) : (
                                <div className="h-16 w-24 rounded bg-blue-100 flex items-center justify-center">
                                  <span className="text-blue-600 font-semibold text-sm">
                                    {course.title.charAt(0)}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {course.title}
                              </div>
                              <div className="text-sm text-gray-500 line-clamp-2">
                                {course.shortDescription || course.description}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {course.instructor?.name || "Unknown"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {course.instructor?.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {course.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {moment(course.createdAt).format("MMM DD, YYYY")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/courses/${course._id}`}
                              className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                              target="_blank"
                            >
                              <Eye className="w-4 h-4" />
                              Preview
                            </Link>
                            <button
                              onClick={() =>
                                handleApprove(course._id, course.title)
                              }
                              disabled={isApproving}
                              className="text-green-600 hover:text-green-900 flex items-center gap-1 disabled:opacity-50"
                            >
                              <Check className="w-4 h-4" />
                              Approve
                            </button>
                            <button
                              onClick={() => openRejectModal(course)}
                              disabled={isRejecting}
                              className="text-red-600 hover:text-red-900 flex items-center gap-1 disabled:opacity-50"
                            >
                              <X className="w-4 h-4" />
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 0 && (
              <Pagination
                currentPage={page}
                totalPages={pagination.totalPages}
                totalItems={pagination.totalResults}
                itemsPerPage={limit}
                onPageChange={(newPage) => setPage(newPage)}
                onPageSizeChange={(newSize) => {
                  setLimit(newSize);
                  setPage(1);
                }}
              />
            )}
          </>
        )}
      </div>

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Reject Course
            </h2>
            <p className="text-gray-600 mb-4">
              {
                'Please provide a reason for rejecting "{selectedCourse?.title}"'
              }
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
              rows={4}
              placeholder="Enter rejection reason..."
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={isRejecting || !rejectionReason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRejecting ? "Rejecting..." : "Reject Course"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}
