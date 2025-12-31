"use client"
import { GoBackRoute } from '@/components/reports/GoBackRoute'
import { StatsCard } from '@/components/reports/StatsCard'
import { StatusBadge } from '@/components/reports/StatusBadge'
import { ProgressBar } from '@/components/reports/ProgressBar'
import { CompletionChart } from '@/components/reports/CompletionChart'
import { Button } from '@/components/ui/button'
import { ChevronRight, Download, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useGetMyReportQuery, useLazyExportMyReportCSVQuery } from '@/store/api/reportApi'
import { useEffect } from 'react'
import { toast } from 'sonner'

export default function MyReportPage() {
    const router = useRouter();

    // Fetch report data
    const { data, isLoading, error } = useGetMyReportQuery();
    const [exportCSV, { isLoading: isExporting }] = useLazyExportMyReportCSVQuery();

    const reportData = data?.data;
    const stats = reportData?.stats;
    const courses = reportData?.courses || [];

    // Handle CSV export
    const handleExportCSV = async () => {
        try {
            const result = await exportCSV().unwrap();

            // Create download link
            const url = window.URL.createObjectURL(result);
            const link = document.createElement('a');
            link.href = url;
            link.download = `my-report-${Date.now()}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success('Report exported successfully');
        } catch (err) {
            console.error('Export error:', err);
            toast.error('Failed to export report');
        }
    };

    const handleCourseClick = (enrollmentId: string) => {
        // Navigate to course details - you may need to adjust this based on your routing structure
        router.push(`/learning/courses/${enrollmentId}`);
    };

    // Handle error
    useEffect(() => {
        if (error) {
            toast.error('Failed to load report data');
        }
    }, [error]);

    // Loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600">Loading your report...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <p className="text-red-600 mb-4">Failed to load report</p>
                    <Button onClick={() => window.location.reload()}>
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    // Empty state
    if (!courses || courses.length === 0) {
        return (
            <div className="space-y-6 bg-white p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <GoBackRoute />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">My Report</h1>
                    <div className="w-[140px]"></div>
                </div>

                <div className="flex flex-col items-center justify-center min-h-[400px]">
                    <p className="text-gray-600 text-lg mb-4">No courses enrolled yet</p>
                    <Button onClick={() => router.push('/courses')}>
                        Browse Courses
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 bg-white p-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <GoBackRoute />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">My Report</h1>
                <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
                    onClick={handleExportCSV}
                    disabled={isExporting}
                >
                    {isExporting ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Exporting...
                        </>
                    ) : (
                        <>
                            <Download className="h-4 w-4 mr-2" />
                            Export as CSV
                        </>
                    )}
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatsCard
                    iconName={'/icons/CourseEnrolled.png'}
                    iconAlt="CourseEnrolled"
                    title="Course Enrolled"
                    value={stats?.courseEnrolled || 0}
                />

                <StatsCard
                    iconName={'/icons/YetToStart.png'}
                    iconAlt="YetToStart"
                    title="Yet to Start"
                    value={stats?.yetToStart || 0}
                />

                <StatsCard
                    iconName={'/icons/InProgress.png'}
                    iconAlt="InProgress"
                    title="In Progress"
                    value={stats?.inProgress || 0}
                />

                <StatsCard
                    iconName={'/icons/Completed.png'}
                    iconAlt="Completed"
                    title="Completed"
                    value={stats?.completed || 0}
                />
            </div>

            {/* Completion Chart */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Course Completion Overview</h2>
                <CompletionChart
                    completed={stats?.completed || 0}
                    inProgress={stats?.inProgress || 0}
                    yetToStart={stats?.yetToStart || 0}
                    showLegend={true}
                    height={300}
                />
            </div>

            {/* Course Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-off-white-2 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SL</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enroll Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Spent</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion %</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {courses.map((course, index) => (
                                <tr
                                    key={course._id}
                                    onClick={() => handleCourseClick(course._id)}
                                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900">{course.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {new Date(course.enrollDate).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {course.completedDate
                                            ? new Date(course.completedDate).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })
                                            : '--'
                                        }
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {course.timeSpent}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <ProgressBar
                                            value={course.completion || course.completionPercentage || 0}
                                            showLabel={true}
                                            height="md"
                                            className="min-w-[150px]"
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <StatusBadge status={course.status} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Button variant="ghost" size="icon">
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
