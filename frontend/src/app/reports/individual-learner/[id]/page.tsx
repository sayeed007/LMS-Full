// app/reports/individual-learner/[id]/page.tsx
"use client";
import { GoBackRoute } from '@/components/reports/GoBackRoute';
import { StatsCard } from '@/components/reports/StatsCard';
import { StatusBadge } from '@/components/reports/StatusBadge';
import { ProgressBar } from '@/components/reports/ProgressBar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronRight, Download, Loader2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useGetIndividualLearnerReportQuery, useLazyExportLearnerReportCSVQuery } from '@/store/api/reportApi';
import { toast } from 'sonner';

export default function IndividualLearnerReport() {
    const router = useRouter();
    const params = useParams();
    const learnerId = params.id as string;

    // Fetch individual learner report
    const { data, isLoading, error, refetch } = useGetIndividualLearnerReportQuery(learnerId);
    const [exportCSV, { isLoading: isExporting }] = useLazyExportLearnerReportCSVQuery();

    const reportData = data?.data;
    const learner = reportData?.learner;
    const stats = reportData?.stats;
    const courses = reportData?.courses || [];

    // Handle CSV export
    const handleExportCSV = async () => {
        try {
            const result = await exportCSV(learnerId).unwrap();

            const url = window.URL.createObjectURL(result);
            const link = document.createElement('a');
            link.href = url;
            link.download = `learner-${learner?.name || learnerId}-report-${Date.now()}.csv`;
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

    const handleCourseClick = (courseId: string) => {
        router.push(`/reports/individual-learner/${learnerId}/course/${courseId}`);
    };

    // Handle error
    useEffect(() => {
        if (error) {
            toast.error('Failed to load learner report');
        }
    }, [error]);

    // Loading state
    if (isLoading && !data) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600">Loading learner report...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error && !data) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <p className="text-red-600 mb-4">Failed to load learner report</p>
                    <Button onClick={() => refetch()}>
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
                    <h1 className="text-2xl font-bold text-gray-900">
                        Individual Learner Report - {learner?.name || 'Unknown'}
                    </h1>
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
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <GoBackRoute />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">
                    Individual Learner Report - {learner?.name || 'Unknown'}
                </h1>
                <div className="flex items-center gap-4">
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
                                <Download className="w-4 h-4 mr-2" />
                                Export as CSV
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Learner Info Card */}
            {learner && (
                <Card className="p-4 bg-gray-50">
                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <p className="text-sm text-gray-600">Email</p>
                            <p className="text-lg font-semibold text-gray-900">{learner.email}</p>
                        </div>
                        {learner.memberSince && (
                            <div className="flex-1">
                                <p className="text-sm text-gray-600">Member Since</p>
                                <p className="text-lg font-semibold text-gray-900">
                                    {new Date(learner.memberSince).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}
                                </p>
                            </div>
                        )}
                    </div>
                </Card>
            )}

            <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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

                {/* Courses Table */}
                <Card className="overflow-hidden border-0">
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
                                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                                            <div className="truncate">{course.name}</div>
                                        </td>
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
                                            <ChevronRight className="h-5 w-5 text-gray-400" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

        </div>
    );
}