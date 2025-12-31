// app/reports/individual-course/page.tsx
"use client";
import { GoBackRoute } from '@/components/reports/GoBackRoute';
import { StatsCard } from '@/components/reports/StatsCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { ArrowRight, Download, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useGetCoursesListQuery, useGetIndividualCourseReportQuery } from '@/store/api/reportApi';
import { toast } from 'sonner';

// Helper function to format time
const formatTimeSpent = (seconds: number): string => {
    if (!seconds || seconds === 0) return '0 min';

    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    const parts = [];
    if (days > 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`);
    if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
    if (minutes > 0 && days === 0) parts.push(`${minutes} min`);

    return parts.length > 0 ? parts.join(' ') : '0 min';
};

// Helper function to format date
const formatDate = (dateString: string | null): string => {
    if (!dateString) return '--';

    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

// Helper function to get status badge color
const getStatusBadgeClass = (status: string): string => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'completed') return 'bg-green-50 text-green-600 hover:bg-green-50';
    if (statusLower === 'in progress') return 'bg-orange-50 text-orange-600 hover:bg-orange-50';
    if (statusLower === 'yet to start' || statusLower === 'not started') return 'bg-gray-50 text-gray-600 hover:bg-gray-50';
    return 'bg-blue-50 text-blue-600 hover:bg-blue-50';
};

export default function IndividualCourseReportPage() {
    const [activeTab, setActiveTab] = useState<'lessons' | 'users'>('lessons');
    const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch courses list
    const { data: coursesData, isLoading: isLoadingCourses, error: coursesError } = useGetCoursesListQuery(searchTerm);
    const courses = coursesData?.data || [];

    // Fetch course report when course is selected
    const { data: reportData, isLoading: isLoadingReport, error: reportError } = useGetIndividualCourseReportQuery(
        selectedCourse || '',
        { skip: !selectedCourse }
    );

    // Auto-select first course when list loads
    useEffect(() => {
        if (courses.length > 0 && !selectedCourse) {
            setSelectedCourse(courses[0].value);
        }
    }, [courses, selectedCourse]);

    // Handle errors
    useEffect(() => {
        if (coursesError) {
            toast.error('Failed to load courses list');
        }
    }, [coursesError]);

    useEffect(() => {
        if (reportError) {
            toast.error('Failed to load course report');
        }
    }, [reportError]);

    const report = reportData?.data;
    const stats = report?.stats;
    const users = report?.users || [];
    const lessonStats = report?.lessonStats || [];


    const UserAvatar = ({ name }: { name: string }) => {
        const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
        return (
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-sm font-medium text-white">
                {initials}
            </div>
        );
    };

    // Loading state
    if (isLoadingCourses && courses.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600">Loading courses...</p>
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
                    <div className="relative">
                        <CustomSelect
                            options={courses}
                            value={selectedCourse}
                            onChange={setSelectedCourse}
                            placeholder="Select a course"
                        />
                        {isLoadingCourses && (
                            <Loader2 className="absolute right-10 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
                        )}
                    </div>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Individual Course Report</h1>
                <div className="w-[140px]"></div>
            </div>

            {/* Content when no course selected */}
            {!selectedCourse && courses.length > 0 && (
                <div className='flex flex-col w-full h-[60vh] justify-center items-center'>
                    <p className="text-gray-600 text-lg mb-4">Select a course to view the report</p>
                    <p className="text-gray-500 text-sm">Use the dropdown above to choose a course</p>
                </div>
            )}

            {/* No courses found */}
            {courses.length === 0 && !isLoadingCourses && (
                <div className='flex flex-col w-full h-[60vh] justify-center items-center'>
                    <p className="text-gray-600 text-lg mb-4">No courses found</p>
                    <p className="text-gray-500 text-sm">Try adjusting your search or contact your administrator</p>
                </div>
            )}

            {/* Loading report data */}
            {selectedCourse && isLoadingReport && (
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                        <p className="text-gray-600">Loading course report...</p>
                    </div>
                </div>
            )}

            {/* Report Content */}
            {selectedCourse && !isLoadingReport && report && (
                <>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <StatsCard
                            iconName={'/icons/TotalLearner.png'}
                            iconAlt="TotalLearner"
                            title="Total Learner"
                            value={stats?.totalLearners || 0}
                        />
                        <StatsCard
                            iconName={'/icons/YetToStart.png'}
                            iconAlt="YetToStart"
                            title="Yet to start"
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

                    {/* Tabs */}
                    <div className="flex border-b border-gray-200 mb-0">
                        <button
                            onClick={() => setActiveTab('lessons')}
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'lessons'
                                ? 'border-blue-600 text-blue-600 font-bold'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            By Lesson
                        </button>
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'users'
                                ? 'border-blue-600 text-blue-600 font-bold'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            By Users
                        </button>
                    </div>

                    {/* Content */}
                    {activeTab === 'users' ? (
                        <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
                            {users.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <p className="text-gray-600 text-lg mb-4">No learners enrolled in this course yet</p>
                                </div>
                            ) : (
                                <table className="w-full">
                                    <thead className="bg-off-white-2 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SL</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Learner</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enroll Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Spent</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion Percentage</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {users.map((user, index) => (
                                            <tr key={user._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        <UserAvatar name={user.name} />
                                                        <div>
                                                            <div className="text-sm font-medium text-blue-600">{user.name}</div>
                                                            <div className="text-sm text-gray-500">{user.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(user.enrollDate)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(user.completedDate)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatTimeSpent(user.timeSpent)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.completionPercentage}%</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <Badge variant="secondary" className={getStatusBadgeClass(user.status)}>
                                                        {user.status}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
                            {lessonStats.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <p className="text-gray-600 text-lg mb-4">No lesson data available for this course</p>
                                </div>
                            ) : (
                                <table className="w-full">
                                    <thead className="bg-off-white-2 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SL</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lesson</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Yet to start</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">In Progress</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {lessonStats.map((lesson, index) => (
                                            <tr key={lesson._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lesson.lesson}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lesson.yetToStart}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lesson.inProgress}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lesson.completed}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}