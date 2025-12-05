import { type CoursePopulated } from '@/store/api/courseApi';
import { useGetOrganizationCoursesQuery } from '@/store/api/organizationApi';
import { BookOpen } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

interface CoursesTabProps {
  orgId: string;
}

export function CoursesTab({ orgId }: CoursesTabProps) {
  const [statusFilter, setStatusFilter] = useState('');

  const { data: coursesData, isLoading } = useGetOrganizationCoursesQuery({
    id: orgId,
    params: { page: 1, limit: 10, status: statusFilter || undefined }
  });

  // Derive status from course boolean flags
  const getCourseStatus = (course: CoursePopulated) => {
    if (course.isDeleted) return 'archived';
    if (course.isPublished) return 'published';
    return 'draft';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-gray-500">Loading courses...</div>
      ) : !coursesData?.data || coursesData.data.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p>No courses found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {coursesData.data.map((course: CoursePopulated) => (
            <div
              key={course._id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
            >
              {course.thumbnail && (
                <Image
                  src={course.thumbnail}
                  alt={course.title}
                  width={400}
                  height={160}
                  className="w-full h-40 object-cover rounded-lg mb-3"
                />
              )}
              <h3 className="font-semibold text-gray-900 mb-2">{course.title}</h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{course.description}</p>
              <div className="flex items-center justify-between">
                {(() => {
                  const status = getCourseStatus(course);
                  return (
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        status === 'published'
                          ? 'bg-green-100 text-green-700'
                          : status === 'draft'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {status}
                    </span>
                  );
                })()}
                {course.instructor && (
                  <span className="text-sm text-gray-600">{course.instructor.name}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
