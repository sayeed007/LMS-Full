// app/reports/individual-learner/[id]/page.tsx
"use client";
import { GoBackRoute } from '@/components/reports/GoBackRoute';
import { StatsCard } from '@/components/reports/StatsCard';
import { StatusBadge } from '@/components/reports/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { ChevronRight, Download } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

// Mock data for learners
const mockLearners = [
    { value: '200065', label: 'MD. Fahim Reza' },
    { value: '200066', label: 'Wade Warren' },
    { value: '200067', label: 'Jerome Bell' },
];

// Mock course data
const mockCourses = [
    {
        id: 1,
        name: 'UI/UX Basic Learning',
        enrollDate: 'Jan 20, 2025',
        completedDate: 'Jan 23, 2025',
        timeSpent: '2 days 13 hour',
        completionPercentage: 50,
        status: 'In Progress'
    },
    {
        id: 2,
        name: 'Foundations of UI/UX Design',
        enrollDate: 'Jan 20, 2025',
        completedDate: 'Jan 23, 2025',
        timeSpent: '2 days 13 hour',
        completionPercentage: 50,
        status: 'In Progress'
    },
    {
        id: 3,
        name: 'UI/UX Mastery: From Wireframes to Prototypes',
        enrollDate: 'Jan 20, 2025',
        completedDate: 'Jan 23, 2025',
        timeSpent: '2 days 13 hour',
        completionPercentage: 50,
        status: 'In Progress'
    },
    {
        id: 4,
        name: 'Design Systems and Scalable Interfaces',
        enrollDate: 'Jan 20, 2025',
        completedDate: 'Jan 23, 2025',
        timeSpent: '2 days 13 hour',
        completionPercentage: 100,
        status: 'Complete'
    },
    {
        id: 5,
        name: 'UI Design with Sketch: A Complete Guide',
        enrollDate: 'Jan 20, 2025',
        completedDate: 'Jan 23, 2025',
        timeSpent: '2 days 13 hour',
        completionPercentage: 100,
        status: 'Complete'
    },
    {
        id: 6,
        name: 'User Journey Mapping & Persona Building',
        enrollDate: 'Jan 20, 2025',
        completedDate: 'Jan 23, 2025',
        timeSpent: '2 days 13 hour',
        completionPercentage: 100,
        status: 'Complete'
    },
    {
        id: 7,
        name: 'UX Workflow with Notion, Miro, and Figma',
        enrollDate: 'Jan 20, 2025',
        completedDate: 'Jan 23, 2025',
        timeSpent: '2 days 13 hour',
        completionPercentage: 100,
        status: 'Complete'
    },
    {
        id: 8,
        name: 'UI/UX Mastery: From Wireframes to Prototypes',
        enrollDate: 'Jan 20, 2025',
        completedDate: 'Jan 23, 2025',
        timeSpent: '2 days 13 hour',
        completionPercentage: 100,
        status: 'Complete'
    },
    {
        id: 9,
        name: 'UI Design with Sketch: A Complete Guide',
        enrollDate: 'Jan 20, 2025',
        completedDate: 'Jan 23, 2025',
        timeSpent: '2 days 13 hour',
        completionPercentage: 100,
        status: 'Complete'
    },
    {
        id: 10,
        name: 'Designing for Accessibility',
        enrollDate: 'Jan 20, 2025',
        completedDate: 'Jan 23, 2025',
        timeSpent: '2 days 13 hour',
        completionPercentage: 100,
        status: 'Complete'
    },
    {
        id: 11,
        name: 'UI/UX Mastery: From Wireframes to Prototypes',
        enrollDate: 'Jan 20, 2025',
        completedDate: 'Jan 23, 2025',
        timeSpent: '2 days 13 hour',
        completionPercentage: 100,
        status: 'Complete'
    }
];

const learnerStats = {
    courseEnrolled: 11,
    yetToStart: 0,
    inProgress: 3,
    completed: 8
};

export default function IndividualLearnerReport() {
    const router = useRouter();
    const params = useParams();
    const learnerId = params.id as string;
    const [selectedLearner, setSelectedLearner] = useState<string | null>(learnerId || '');

    const handleCourseClick = (courseId: number) => {
        router.push(`/reports/individual-learner/${learnerId}/course/${courseId}`);
    };

    return (
        <div className="space-y-6 bg-white p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <GoBackRoute />
                    <CustomSelect
                        options={mockLearners}
                        value={selectedLearner}
                        onChange={(learner) => setSelectedLearner(learner)}
                        placeholder="Select a Learner"
                    />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Individual Learner Report</h1>
                <div className="flex items-center gap-4">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
                        <Download className="w-4 h-4 mr-2" />
                        Export as CSV
                    </Button>
                </div>
            </div>


            <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <StatsCard
                        iconName={'/icons/CourseEnrolled.png'}
                        iconAlt="CourseEnrolled"
                        title="Course Enrolled"
                        value={learnerStats.courseEnrolled}
                    />

                    <StatsCard
                        iconName={'/icons/YetToStart.png'}
                        iconAlt="YetToStart"
                        title="Yet to Start"
                        value={learnerStats.yetToStart}
                    />

                    <StatsCard
                        iconName={'/icons/InProgress.png'}
                        iconAlt="InProgress"
                        title="In Progress"
                        value={learnerStats.inProgress}
                    />

                    <StatsCard
                        iconName={'/icons/Completed.png'}
                        iconAlt="Completed"
                        title="Completed"
                        value={learnerStats.completed}
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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion Percentage</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {mockCourses.map((course, index) => (
                                    <tr
                                        key={course.id}
                                        onClick={() => handleCourseClick(course.id)}
                                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                                            <div className="truncate">{course.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{course.enrollDate}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{course.completedDate}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{course.timeSpent}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{course.completionPercentage}%</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <StatusBadge
                                                status={course.status}
                                                percentage={course.completionPercentage}
                                            />
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