// app/reports/individual-learner/[id]/course/[courseId]/page.tsx
"use client";
import { GoBackRoute } from '@/components/reports/GoBackRoute';
import { StatusBadge } from '@/components/reports/StatusBadge';
import { StatusIcon } from '@/components/reports/StatusIcon';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, Clock, Loader2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import { useGetLearnerCourseProgressQuery } from '@/store/api/reportApi';
import { toast } from 'sonner';


export default function IndividualCourseReport() {
    const params = useParams();
    const learnerId = params.id as string;
    const courseId = params.courseId as string;

    // Fetch learner course progress
    const { data, isLoading, error, refetch } = useGetLearnerCourseProgressQuery({
        learnerId,
        courseId
    });

    const reportData = data?.data;
    const course = reportData?.course;
    const enrollment = reportData?.enrollment;
    const stats = reportData?.stats;
    const lessons = reportData?.lessons || [];

    // Handle error
    useEffect(() => {
        if (error) {
            toast.error('Failed to load course progress');
        }
    }, [error]);

    // Loading state
    if (isLoading && !data) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600">Loading course progress...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error && !data) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <p className="text-red-600 mb-4">Failed to load course progress</p>
                    <Button onClick={() => refetch()}>
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    // Empty state
    if (!course) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <p className="text-gray-600 text-lg">Course not found</p>
                </div>
            </div>
        );
    }

    // Format time spent (convert seconds to readable format)
    const formatTimeSpent = (seconds: number) => {
        if (!seconds) return '0 Min';
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);

        if (hours > 0) {
            return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} min`;
        }
        return `${minutes} min`;
    };

    return (
        <div className="space-y-6 bg-white p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex flex-2 items-center gap-4">
                    <GoBackRoute />
                    <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
                </div>

                <div className="flex flex-1 items-center justify-end gap-8">
                    <Card className="p-2 flex-1">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Completed</p>
                                <p className="text-3xl font-bold text-gray-900">{stats?.completed || 0}%</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-2 flex-1">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-orange-100 rounded-lg">
                                <Clock className="h-8 w-8 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Time Spent</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {formatTimeSpent(stats?.timeSpent || 0)}
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="p-4">
                    <p className="text-sm text-gray-600">Total Lessons</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.totalLessons || 0}</p>
                </Card>
                <Card className="p-4">
                    <p className="text-sm text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-green-600">{stats?.completedLessons || 0}</p>
                </Card>
                <Card className="p-4">
                    <p className="text-sm text-gray-600">In Progress</p>
                    <p className="text-2xl font-bold text-orange-600">{stats?.inProgressLessons || 0}</p>
                </Card>
                <Card className="p-4">
                    <p className="text-sm text-gray-600">Yet to Start</p>
                    <p className="text-2xl font-bold text-gray-600">{stats?.yetToStartLessons || 0}</p>
                </Card>
            </div>

            <div className="mx-auto px-4 sm:px-6 lg:px-8 py-4">
                {/* Lessons Table */}
                <Card className="overflow-hidden">
                    {lessons.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <p className="text-gray-600 text-lg">No lessons found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-off-white-2 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SL</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lesson</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Spent</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion %</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {lessons.map((lesson, index) => (
                                        <tr key={lesson._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900 max-w-md">
                                                <div className="flex items-center space-x-2">
                                                    <StatusIcon status={lesson.status} />
                                                    <span className="truncate">{lesson.title}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {lesson.startDate
                                                    ? new Date(lesson.startDate).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })
                                                    : '--'
                                                }
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatTimeSpent(lesson.timeSpent)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {lesson.completionPercentage > 0 ? `${lesson.completionPercentage}%` : '--'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <StatusBadge status={lesson.status} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}