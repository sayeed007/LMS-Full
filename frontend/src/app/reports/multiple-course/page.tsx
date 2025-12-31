"use client";
import { GoBackRoute } from '@/components/reports/GoBackRoute';
import { StatsCard } from '@/components/reports/StatsCard';
import { Pagination } from '@/components/reports/Pagination';
import { DateRangeFilter } from '@/components/reports/DateRangeFilter';
import { Button } from '@/components/ui/button';
import { Download, Loader2, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useGetMultipleCoursesReportMutation } from '@/store/api/reportApi';
import { toast } from 'sonner';

export default function MultipleCourseReport() {
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [dateRange, setDateRange] = useState<{ start: string | null; end: string | null }>({
        start: null,
        end: null
    });

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setCurrentPage(1); // Reset to first page on search
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Fetch multiple courses report
    const [fetchReport, { data, isLoading, error }] = useGetMultipleCoursesReportMutation();

    // Fetch data on mount and when search/page/date range changes
    useEffect(() => {
        fetchReport({
            search: debouncedSearch || undefined,
            page: currentPage,
            limit: pageSize,
            startDate: dateRange.start,
            endDate: dateRange.end
        });
    }, [debouncedSearch, currentPage, pageSize, dateRange, fetchReport]);

    const handleDateRangeChange = (startDate: string | null, endDate: string | null) => {
        setDateRange({ start: startDate, end: endDate });
        setCurrentPage(1); // Reset to first page when filter changes
    };

    const reportData = data?.data;
    const stats = reportData?.stats;
    const courses = reportData?.courses || [];

    // Handle error
    useEffect(() => {
        if (error) {
            toast.error('Failed to load courses report');
        }
    }, [error]);

    // Loading state
    if (isLoading && !data) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600">Loading courses report...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error && !data) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <p className="text-red-600 mb-4">Failed to load courses report</p>
                    <Button onClick={() => fetchReport({})}>
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 bg-white p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <GoBackRoute />
                    {/* Search Bar */}
                    <div className="relative w-[280px]">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                            type="text"
                            placeholder="Search courses..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    {isLoading && (
                        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                    )}
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Multiple Course Report</h1>
                <div className="flex items-center gap-4">
                    <DateRangeFilter
                        onDateRangeChange={handleDateRangeChange}
                        label="Filter by Created Date"
                    />
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <StatsCard
                    iconName={'/icons/CourseEnrolled.png'}
                    iconAlt="TotalCourses"
                    title="Total Courses"
                    value={stats?.totalCourses || 0}
                />
                <StatsCard
                    iconName={'/icons/Completed.png'}
                    iconAlt="Published"
                    title="Published"
                    value={stats?.published || 0}
                />
                <StatsCard
                    iconName={'/icons/InProgress.png'}
                    iconAlt="Unpublished"
                    title="Unpublished"
                    value={stats?.unpublished || 0}
                />
                <StatsCard
                    iconName={'/icons/TotalLearner.png'}
                    iconAlt="TotalEnrollments"
                    title="Total Enrollments"
                    value={stats?.totalEnrollments || 0}
                />
            </div>

            {/* Course Table */}
            <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
                {courses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <p className="text-gray-600 text-lg mb-4">
                            {searchQuery ? 'No courses found matching your search' : 'No courses found'}
                        </p>
                        {searchQuery && (
                            <Button onClick={() => setSearchQuery('')} variant="outline">
                                Clear Search
                            </Button>
                        )}
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-off-white-2 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SL</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Learners</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Yet to Start</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">In Progress</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {courses.map((course, index) => (
                                <tr key={course._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {(currentPage - 1) * pageSize + index + 1}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-blue-600">{course.name}</div>
                                        {course.description && (
                                            <div className="text-xs text-gray-500 truncate max-w-xs">{course.description}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{course.totalLearners}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{course.yetToStart}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{course.inProgress}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{course.completed}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {reportData?.pagination && courses.length > 0 && (
                <Pagination
                    currentPage={reportData.pagination.currentPage}
                    totalPages={reportData.pagination.totalPages}
                    totalItems={reportData.pagination.totalItems}
                    itemsPerPage={reportData.pagination.itemsPerPage}
                    onPageChange={(page) => setCurrentPage(page)}
                    onPageSizeChange={(size) => {
                        setPageSize(size);
                        setCurrentPage(1);
                    }}
                />
            )}
        </div>
    );
}