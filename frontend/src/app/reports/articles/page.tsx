"use client"
import { GoBackRoute } from '@/components/reports/GoBackRoute'
import { StatsCard } from '@/components/reports/StatsCard'
import { Button } from '@/components/ui/button'
import type { ReportStats } from '@/types'
import { Download } from 'lucide-react'

interface ArticleReportTypes {
    id: number;
    name: string;
    totalViewer: number;
    comments: number;
    rating: number;
    yesRating: number;
    noRating: number;
}

// Mock data - replace with your actual data fetching
const mockData: { stats: ReportStats; articles: ArticleReportTypes[] } = {
    stats: {
        total: 65,
        published: 45,
        unpublished: 20,
    },
    articles: [
        {
            id: 1,
            name: "Figma Essentials for UI Designers",
            totalViewer: 120,
            comments: 53,
            rating: 96,
            yesRating: 75,
            noRating: 21
        },
        {
            id: 2,
            name: "Serverless Architecture: Benefits, Drawbacks, and Use Cases",
            totalViewer: 120,
            comments: 53,
            rating: 96,
            yesRating: 75,
            noRating: 21
        },
        {
            id: 3,
            name: "Becoming a T-Shaped Designer: What It Means and Why It Matters",
            totalViewer: 120,
            comments: 53,
            rating: 96,
            yesRating: 75,
            noRating: 21
        },
        {
            id: 4,
            name: "From Wireframes to Wow: The UI/UX Journey Explained",
            totalViewer: 120,
            comments: 53,
            rating: 96,
            yesRating: 75,
            noRating: 21
        },
        {
            id: 5,
            name: "Breaking Monoliths: How Microservices Redefine Software Architecture",
            totalViewer: 120,
            comments: 53,
            rating: 96,
            yesRating: 75,
            noRating: 21
        },
        {
            id: 6,
            name: "Learning in Public: How Sharing Your Work Builds Reputation and Opportunity",
            totalViewer: 120,
            comments: 53,
            rating: 96,
            yesRating: 75,
            noRating: 21
        },
        {
            id: 7,
            name: "Becoming a T-Shaped Designer: What It Means and Why It Matters",
            totalViewer: 120,
            comments: 53,
            rating: 96,
            yesRating: 75,
            noRating: 21
        },
        {
            id: 8,
            name: "Breaking Monoliths: How Microservices Redefine Software Architecture",
            totalViewer: 120,
            comments: 53,
            rating: 96,
            yesRating: 75,
            noRating: 21
        },
        {
            id: 9,
            name: "Learning in Public: How Sharing Your Work Builds Reputation and Opportunity",
            totalViewer: 120,
            comments: 53,
            rating: 96,
            yesRating: 75,
            noRating: 21
        },
        {
            id: 10,
            name: "Becoming a T-Shaped Designer: What It Means and Why It Matters",
            totalViewer: 120,
            comments: 53,
            rating: 96,
            yesRating: 75,
            noRating: 21
        }
    ]
}

export default function ArticleOverview() {
    const handleExportCSV = () => {
        // Implementation for CSV export
        const csvContent = [
            ['SL', 'Article Name', 'Total Viewer', 'Comments', 'Rating', 'Yes Rating', 'No Rating'],
            ...mockData.articles.map(article => [
                article.id,
                `"${article.name}"`, // Wrap in quotes to handle commas in titles
                article.totalViewer,
                article.comments,
                article.rating,
                article.yesRating,
                article.noRating
            ])
        ]

        const csvString = csvContent.map(row => row.join(',')).join('\n')
        const blob = new Blob([csvString], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'article-overview.csv'
        a.click()
        window.URL.revokeObjectURL(url)
    }

    return (
        <div className="space-y-6 bg-white p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <GoBackRoute />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Article Overview</h1>
                <div className="flex items-center gap-4">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
                        onClick={handleExportCSV}
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Export as CSV
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <StatsCard
                    iconName={'/icons/TotalArticle.png'}
                    iconAlt="TotalArticle"
                    title="Total Article"
                    value={mockData.stats.total}
                />

                <StatsCard
                    iconName={'/icons/Completed.png'}
                    iconAlt="Published"
                    title="Published"
                    value={mockData.stats.published}
                />
                <StatsCard
                    iconName={'/icons/InProgress.png'}
                    iconAlt="Unpublished"
                    title="Unpublished"
                    value={mockData.stats.unpublished}
                />
            </div>

            {/* Article Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-off-white-2 border-b border-gray-200">
                        <tr>
                            {['SL', 'Article Name', 'Total Viewer', 'Engagement'].map((header) => (
                                <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {mockData.articles.map((article) => (
                            <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {article.id}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-medium text-gray-900 max-w-md">
                                        {article.name}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {article.totalViewer}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                        <span className="font-medium">{article.comments} comment</span>
                                        <span className="mx-1 text-gray-400">|</span>
                                        <span className="font-medium">{article.rating} rating</span>
                                        <span className="mx-2 text-gray-500">
                                            (<span className="text-green-600">Yes {article.yesRating}</span>
                                            <span className="mx-1 text-gray-400">|</span>
                                            <span className="text-red-600">No {article.noRating}</span>)
                                        </span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}