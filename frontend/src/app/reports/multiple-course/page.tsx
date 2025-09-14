"use client"
import { GoBackRoute } from '@/components/reports/GoBackRoute'
import { StatsCard } from '@/components/reports/StatsCard'
import { Button } from '@/components/ui/button'
import type { CourseSummary, ReportStats } from '@/types'
import { Download } from 'lucide-react'


// Define the mockData with explicit type
const mockData: { stats: ReportStats; courses: CourseSummary[] } = {
    stats: {
        total: 65,
        published: 45,
        unpublished: 20,
    },
    courses: Array.from({ length: 12 }, (_, i) => ({
        id: i + 1,
        name: "Figma Essentials for UI Designers",
        totalLearners: 120,
        yetToStart: 3,
        inProgress: 1,
        completed: 5,
    })),
};

export default function MultipleCourseReport() {

    return (
        <div className="space-y-6 bg-white p-4">

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <GoBackRoute />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Multiple Course Report</h1>
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
                    iconName={'/icons/CourseEnrolled.png'}
                    iconAlt="TotalLearner"
                    title="Total Courses"
                    value={mockData.stats.total}
                />

                <StatsCard
                    iconName={'/icons/Completed.png'}
                    iconAlt="TotalLearner"
                    title="Published"
                    value={mockData.stats.published}
                />
                <StatsCard
                    iconName={'/icons/InProgress.png'}
                    iconAlt="TotalLearner"
                    title="Unpublished"
                    value={mockData.stats.unpublished}
                />
            </div>

            {/* Course Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-off-white-2 border-b border-gray-200">
                        <tr>
                            {['SL', 'Course', 'Total Learner', 'Yet to start', 'In Progress', 'Completed'].map((header) => (
                                <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {mockData.courses.map((course, index) => (
                            <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {course.name} {index + 1}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {course.totalLearners}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {course.yetToStart}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {course.inProgress}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {course.completed}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}