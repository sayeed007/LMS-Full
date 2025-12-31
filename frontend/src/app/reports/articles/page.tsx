"use client"
import { GoBackRoute } from '@/components/reports/GoBackRoute'
import { StatsCard } from '@/components/reports/StatsCard'
import { Button } from '@/components/ui/button'
import { Download, Loader2, Search } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useGetArticlesReportQuery, useLazyExportArticlesReportCSVQuery } from '@/store/api/reportApi'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export default function ArticlesReportPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Fetch articles report
    const { data, isLoading, error, refetch } = useGetArticlesReportQuery({
        search: debouncedSearch || undefined,
    });

    const [exportCSV, { isLoading: isExporting }] = useLazyExportArticlesReportCSVQuery();

    const reportData = data?.data;
    const stats = reportData?.stats;
    const articles = reportData?.articles || [];

    // Handle CSV export
    const handleExportCSV = async () => {
        try {
            const result = await exportCSV({
                search: debouncedSearch || undefined,
            }).unwrap();

            const url = window.URL.createObjectURL(result);
            const link = document.createElement('a');
            link.href = url;
            link.download = `articles-report-${Date.now()}.csv`;
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

    // Handle error
    useEffect(() => {
        if (error) {
            toast.error('Failed to load articles report');
        }
    }, [error]);

    // Loading state
    if (isLoading && !data) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600">Loading articles report...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error && !data) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <p className="text-red-600 mb-4">Failed to load articles report</p>
                    <Button onClick={() => refetch()}>
                        Try Again
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
                <h1 className="text-2xl font-bold text-gray-900">Articles Overview</h1>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard
                    iconName={'/icons/TotalArticles.png'}
                    iconAlt="Total Articles"
                    title="Total Articles"
                    value={stats?.total || 0}
                />

                <StatsCard
                    iconName={'/icons/PublishedArticles.png'}
                    iconAlt="Published"
                    title="Published"
                    value={stats?.published || 0}
                />

                <StatsCard
                    iconName={'/icons/UnpublishedArticles.png'}
                    iconAlt="Unpublished"
                    title="Unpublished"
                    value={stats?.unpublished || 0}
                />
            </div>

            {/* Search */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Search articles..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                {isLoading && (
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                )}
            </div>

            {/* Articles Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {articles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <p className="text-gray-600 text-lg mb-4">
                            {searchTerm ? 'No articles found matching your search' : 'No articles available'}
                        </p>
                        {searchTerm && (
                            <Button onClick={() => setSearchTerm('')} variant="outline">
                                Clear Search
                            </Button>
                        )}
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
                                        Article Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Total Viewer
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Comments
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Rating
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Yes Rating
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        No Rating
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {articles.map((article, index) => (
                                    <tr key={article._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {index + 1}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            <div className="max-w-md truncate">{article.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {article.totalViewer}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {article.comments}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {article.rating}%
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {article.yesRating}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {article.noRating}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
