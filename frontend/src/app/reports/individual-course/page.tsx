// app/reports/individual-course/page.tsx
"use client";
import { GoBackRoute } from '@/components/reports/GoBackRoute';
import { StatsCard } from '@/components/reports/StatsCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { ArrowRight, Download } from 'lucide-react';
import { useState } from 'react';


// Mock data - replace with your actual data fetching
const courseData = {
    totalLearners: 120,
    yetToStart: 0,
    inProgress: 45,
    completed: 24
};

const usersData = [
    {
        id: 1,
        name: "Annette Black",
        userId: "200065",
        avatar: "AB",
        enrollDate: "Jan 20, 2025",
        completedDate: "--",
        timeSpent: "2 days 13 hour",
        completionPercentage: 50,
        status: "In Progress"
    },
    {
        id: 2,
        name: "Devon Lane",
        userId: "200065",
        avatar: "DL",
        enrollDate: "Jan 20, 2025",
        completedDate: "--",
        timeSpent: "2 days 13 hour",
        completionPercentage: 50,
        status: "In Progress"
    },
    {
        id: 3,
        name: "Floyd Miles",
        userId: "200065",
        avatar: "FM",
        enrollDate: "Jan 20, 2025",
        completedDate: "--",
        timeSpent: "2 days 13 hour",
        completionPercentage: 50,
        status: "In Progress"
    },
    {
        id: 4,
        name: "Guy Hawkins",
        userId: "200065",
        avatar: "GH",
        enrollDate: "Jan 20, 2025",
        completedDate: "--",
        timeSpent: "2 days 13 hour",
        completionPercentage: 50,
        status: "In Progress"
    },
    {
        id: 5,
        name: "Leslie Alexander",
        userId: "200065",
        avatar: "LA",
        enrollDate: "Jan 20, 2025",
        completedDate: "--",
        timeSpent: "2 days 13 hour",
        completionPercentage: 50,
        status: "In Progress"
    },
    {
        id: 6,
        name: "Jenny Wilson",
        userId: "200065",
        avatar: "JW",
        enrollDate: "Jan 20, 2025",
        completedDate: "--",
        timeSpent: "2 days 13 hour",
        completionPercentage: 50,
        status: "In Progress"
    },
    {
        id: 7,
        name: "Savannah Nguyen",
        userId: "200065",
        avatar: "SN",
        enrollDate: "Jan 20, 2025",
        completedDate: "--",
        timeSpent: "2 days 13 hour",
        completionPercentage: 50,
        status: "In Progress"
    },
    {
        id: 8,
        name: "Theresa Webb",
        userId: "200065",
        avatar: "TW",
        enrollDate: "Jan 20, 2025",
        completedDate: "--",
        timeSpent: "2 days 13 hour",
        completionPercentage: 50,
        status: "In Progress"
    },
    {
        id: 9,
        name: "Eleanor Pena",
        userId: "200065",
        avatar: "EP",
        enrollDate: "Jan 20, 2025",
        completedDate: "--",
        timeSpent: "2 days 13 hour",
        completionPercentage: 50,
        status: "In Progress"
    },
    {
        id: 10,
        name: "Darlene Robertson",
        userId: "200065",
        avatar: "DR",
        enrollDate: "Jan 20, 2025",
        completedDate: "--",
        timeSpent: "2 days 13 hour",
        completionPercentage: 50,
        status: "In Progress"
    },
    {
        id: 11,
        name: "Esther Howard",
        userId: "200065",
        avatar: "EH",
        enrollDate: "Jan 20, 2025",
        completedDate: "--",
        timeSpent: "2 days 13 hour",
        completionPercentage: 50,
        status: "In Progress"
    }
];

const lessonsData = [
    {
        id: 1,
        lesson: "Figma Essentials for UI Designers",
        yetToStart: 3,
        inProgress: 1,
        completed: 5
    },
    {
        id: 2,
        lesson: "Prototyping with Adobe XD",
        yetToStart: 3,
        inProgress: 1,
        completed: 5
    },
    {
        id: 3,
        lesson: "UI Design with Sketch: A Complete Guide",
        yetToStart: 3,
        inProgress: 1,
        completed: 5
    },
    {
        id: 4,
        lesson: "Figma Essentials for UI Designers",
        yetToStart: 3,
        inProgress: 1,
        completed: 5
    },
    {
        id: 5,
        lesson: "UX Workflow with Notion, Miro, and Figma",
        yetToStart: 3,
        inProgress: 1,
        completed: 5
    },
    {
        id: 6,
        lesson: "UI Design with Sketch: A Complete Guide",
        yetToStart: 3,
        inProgress: 1,
        completed: 5
    },
    {
        id: 7,
        lesson: "Prototyping with Adobe XD",
        yetToStart: 3,
        inProgress: 1,
        completed: 5
    },
    {
        id: 8,
        lesson: "Figma Essentials for UI Designers",
        yetToStart: 3,
        inProgress: 1,
        completed: 5
    },
    {
        id: 9,
        lesson: "Prototyping with Adobe XD",
        yetToStart: 3,
        inProgress: 1,
        completed: 5
    },
    {
        id: 10,
        lesson: "UX Workflow with Notion, Miro, and Figma",
        yetToStart: 3,
        inProgress: 1,
        completed: 5
    },
    {
        id: 11,
        lesson: "Figma Essentials for UI Designers",
        yetToStart: 3,
        inProgress: 1,
        completed: 5
    }
];

const courseOptions = [
    { value: 'foundation-ui-ux', label: 'Foundation of UI/UX' },
    { value: 'advanced-react', label: 'Advanced React' },
    { value: 'javascript-fundamentals', label: 'JavaScript Fundamentals' },
    { value: 'web-design-principles', label: 'Web Design Principles' }
];

export default function IndividualCourseReportPage() {
    const [activeTab, setActiveTab] = useState<'lessons' | 'users'>('lessons');
    const [selectedCourse, setSelectedCourse] = useState<string | null>('foundation-ui-ux');


    const UserAvatar = ({ name, avatar }: { name: string; avatar: string }) => (
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium text-blue-600">
            {avatar} {name}
        </div>
    );

    return (
        <div className="space-y-6 bg-white p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <GoBackRoute />
                    <div className="flex items-center gap-2 z-10">
                        {/* Option 0 */}
                        <CustomSelect
                            options={courseOptions}
                            value={selectedCourse}
                            onChange={setSelectedCourse}
                            placeholder="Select a course"
                        />
                    </div>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Individual Course Report</h1>
                <div className="flex items-center gap-4">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
                        <Download className="w-4 h-4 mr-2" />
                        Export as CSV
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <StatsCard
                    iconName={'/icons/TotalLearner.png'}
                    iconAlt="TotalLearner"
                    title="Total Learner"
                    value={courseData.totalLearners}
                />
                <StatsCard
                    iconName={'/icons/YetToStart.png'}
                    iconAlt="YetToStart"
                    title="Yet to start"
                    value={courseData.yetToStart}
                />
                <StatsCard
                    iconName={'/icons/InProgress.png'}
                    iconAlt="InProgress"
                    title="In Progress"
                    value={courseData.inProgress}
                />
                <StatsCard
                    iconName={'/icons/Completed.png'}
                    iconAlt="Completed"
                    title="Completed"
                    value={courseData.completed}
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
                    by Users
                </button>
            </div>

            {/* Content */}
            {activeTab === 'users' ? (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-off-white-2 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    SL
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Learner
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Enroll Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Completed Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Time Spent
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Completion Percentage
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {usersData.map((user, index) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {index + 1}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <UserAvatar name={user.name} avatar={user.avatar} />
                                            <div>
                                                <div className="text-sm font-medium text-blue-600">
                                                    {user.name}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {user.userId}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {user.enrollDate}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {user.completedDate}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {user.timeSpent}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {user.completionPercentage}%
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Badge
                                            variant="secondary"
                                            className="bg-orange-50 text-orange-600 hover:bg-orange-50"
                                        >
                                            {user.status}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Button variant="ghost" size="sm">
                                            <ArrowRight className="w-4 h-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-off-white-2 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    SL
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Lesson
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Yet to start
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    In Progress
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Completed
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {lessonsData.map((lesson, index) => (
                                <tr key={lesson.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {index + 1}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {lesson.lesson}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {lesson.yetToStart}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {lesson.inProgress}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {lesson.completed}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}