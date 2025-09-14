// app/reports/individual-learner/[id]/course/[courseId]/page.tsx
"use client";
import { GoBackRoute } from '@/components/reports/GoBackRoute';
import { StatusBadge } from '@/components/reports/StatusBadge';
import { StatusIcon } from '@/components/reports/StatusIcon';
import { Card } from '@/components/ui/card';
import { CheckCircle, Clock } from 'lucide-react';

// Mock course lessons data
const mockLessons = [
    {
        id: 1,
        lesson: 'UI/UX Basic',
        startDate: 'Jul 20, 2025',
        timeSpent: '40 Min',
        completionPercentage: 100,
        status: 'Complete'
    },
    {
        id: 2,
        lesson: 'UI/UX for E-Commerce',
        startDate: 'Jul 20, 2025',
        timeSpent: '40 Min',
        completionPercentage: 100,
        status: 'Complete'
    },
    {
        id: 3,
        lesson: 'Masterclass in Human-Centered Design and Innovation',
        startDate: 'Jul 20, 2025',
        timeSpent: '40 Min',
        completionPercentage: 100,
        status: 'Complete'
    },
    {
        id: 4,
        lesson: 'Design Systems: From Components to Consistency',
        startDate: 'Jul 20, 2025',
        timeSpent: '40 Min',
        completionPercentage: 100,
        status: 'Complete'
    },
    {
        id: 5,
        lesson: 'Quiz Test',
        startDate: 'Jul 20, 2025',
        timeSpent: '40 Min',
        completionPercentage: 100,
        status: 'Complete'
    },
    {
        id: 6,
        lesson: 'Creating Conversational Interfaces',
        startDate: 'Jul 20, 2025',
        timeSpent: '40 Min',
        completionPercentage: 50,
        status: 'In Progress'
    },
    {
        id: 7,
        lesson: 'Data-Driven UX Design',
        startDate: '--',
        timeSpent: '--',
        completionPercentage: 0,
        status: 'Yet to Start'
    },
    {
        id: 8,
        lesson: 'Quiz Test',
        startDate: '--',
        timeSpent: '--',
        completionPercentage: 0,
        status: 'Yet to Start'
    }
];

// Mock course data
const courseData = {
    title: 'Masterclass in Human-Centered Design and Innovation',
    completed: 70,
    timeSpent: 20
};


export default function IndividualCourseReport() {

    return (
        <div className="space-y-6 bg-white p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex flex-2 items-center gap-4">
                    <GoBackRoute />
                    <h1 className="text-2xl font-bold text-gray-900">{courseData.title}</h1>
                </div>

                <div className="flex flex-1 items-center justify-end gap-8">
                    <Card className="p-2 flex-1">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Completed</p>
                                <p className="text-3xl font-bold text-gray-900">{courseData.completed}%</p>
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
                                <p className="text-3xl font-bold text-gray-900">{courseData.timeSpent} hours</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            <div className="mx-auto px-4 sm:px-6 lg:px-8 py-4">
                {/* Lessons Table */}
                <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-off-white-2 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SL</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lesson</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Spent</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion Percentage</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {mockLessons.map((lesson, index) => (
                                    <tr key={lesson.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900 max-w-md">
                                            <div className="flex items-center space-x-2">
                                                <StatusIcon status={lesson.status} />
                                                <span className="truncate">{lesson.lesson}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lesson.startDate}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lesson.timeSpent}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {lesson.completionPercentage > 0 ? `${lesson.completionPercentage}%` : '--'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <StatusBadge
                                                status={lesson.status}
                                            />
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