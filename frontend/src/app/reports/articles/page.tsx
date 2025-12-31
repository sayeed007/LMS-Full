"use client"
import { GoBackRoute } from '@/components/reports/GoBackRoute'
import { StatsCard } from '@/components/reports/StatsCard'
import { Pagination } from '@/components/reports/Pagination'
import { DateRangeFilter } from '@/components/reports/DateRangeFilter'
import { SortableTableHeader } from '@/components/reports/SortableTableHeader'
import { Button } from '@/components/ui/button'
import { Download, Loader2, Search } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useGetArticlesReportQuery, useLazyExportArticlesReportCSVQuery, useLazyExportArticlesReportPDFQuery } from '@/store/api/reportApi'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export default function ArticlesReportPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [dateRange, setDateRange] = useState<{ start: string | null; end: string | null }>({
        start: null,
        end: null
    });
    const [sortBy, setSortBy] = useState<string>('createdAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(1); // Reset to first page on search
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Fetch articles report
    const { data, isLoading, error, refetch } = useGetArticlesReportQuery({
        search: debouncedSearch || undefined,
        page: currentPage,
        limit: pageSize,
        startDate: dateRange.start,
        endDate: dateRange.end,
        sortBy,
        sortOrder
    });

    const handleDateRangeChange = (startDate: string | null, endDate: string | null) => {
        setDateRange({ start: startDate, end: endDate });
        setCurrentPage(1); // Reset to first page when filter changes
    };

    const handleSort = (newSortBy: string, newSortOrder: 'asc' | 'desc') => {
        setSortBy(newSortBy);
        setSortOrder(newSortOrder);
        setCurrentPage(1); // Reset to first page when sorting changes
    };

    // CSV export
    const [exportCSV, { isLoading: isExporting }] = useLazyExportArticlesReportCSVQuery();

    // PDF export
    const [exportPDF, { isLoading: isExportingPDF }] = useLazyExportArticlesReportPDFQuery();

    const reportData = data?.data;
    const stats = reportData?.stats;
    const articles = reportData?.articles || [];

    // Handle CSV export
    const handleExportCSV = async () => {
        try {
            const result = await exportCSV({
                search: debouncedSearch || undefined,
                startDate: dateRange.start,
                endDate: dateRange.end
            }).unwrap();

            const url = window.URL.createObjectURL(result);
            const link = document.createElement('a');
            link.href = url;
            link.download = `articles-report-${Date.now()}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success('CSV report exported successfully');
        } catch (err) {
            console.error('Export error:', err);
            toast.error('Failed to export CSV report');
        }
    };

    // Handle PDF export
    const handleExportPDF = async () => {
        try {
            const result = await exportPDF({
                search: debouncedSearch || undefined,
                startDate: dateRange.start,
                endDate: dateRange.end
            }).unwrap();

            const url = window.URL.createObjectURL(result);
            const link = document.createElement('a');
            link.href = url;
            link.download = `articles-report-${Date.now()}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.success('PDF report exported successfully');
        } catch (err) {
            console.error('Export error:', err);
            toast.error('Failed to export PDF report');
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
                <div className="flex items-center gap-4">
                    <Button
                        onClick={handleExportCSV}
                        disabled={isExporting}
                        variant="outline"
                        className="flex items-center gap-2"
                    >
                        {isExporting ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Exporting CSV...
                            </>
                        ) : (
                            <>
                                <Download className="h-4 w-4" />
                                Export CSV
                            </>
                        )}
                    </Button>
                    <Button
                        onClick={handleExportPDF}
                        disabled={isExportingPDF}
                        variant="outline"
                        className="flex items-center gap-2"
                    >
                        {isExportingPDF ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Exporting PDF...
                            </>
                        ) : (
                            <>
                                <Download className="h-4 w-4" />
                                Export PDF
                            </>
                        )}
                    </Button>
                </div>
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

            {/* Search & Filters */}
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
                <DateRangeFilter
                    onDateRangeChange={handleDateRangeChange}
                    label="Filter by Created Date"
                />
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
                                    <SortableTableHeader
                                        label="Article Name"
                                        sortKey="title"
                                        currentSortBy={sortBy}
                                        currentSortOrder={sortOrder}
                                        onSort={handleSort}
                                    />
                                    <SortableTableHeader
                                        label="Total Viewer"
                                        sortKey="totalViewer"
                                        currentSortBy={sortBy}
                                        currentSortOrder={sortOrder}
                                        onSort={handleSort}
                                    />
                                    <SortableTableHeader
                                        label="Comments"
                                        sortKey="comments"
                                        currentSortBy={sortBy}
                                        currentSortOrder={sortOrder}
                                        onSort={handleSort}
                                    />
                                    <SortableTableHeader
                                        label="Rating"
                                        sortKey="rating"
                                        currentSortBy={sortBy}
                                        currentSortOrder={sortOrder}
                                        onSort={handleSort}
                                    />
                                    <SortableTableHeader
                                        label="Yes Rating"
                                        sortKey="yesRating"
                                        currentSortBy={sortBy}
                                        currentSortOrder={sortOrder}
                                        onSort={handleSort}
                                    />
                                    <SortableTableHeader
                                        label="No Rating"
                                        sortKey="noRating"
                                        currentSortBy={sortBy}
                                        currentSortOrder={sortOrder}
                                        onSort={handleSort}
                                    />
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {articles.map((article, index) => (
                                    <tr key={article._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {(currentPage - 1) * pageSize + index + 1}
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

            {/* Pagination */}
            {reportData?.pagination && articles.length > 0 && (
                <Pagination
                    currentPage={reportData.pagination.currentPage}
                    totalPages={reportData.pagination.totalPages}
                    totalItems={reportData.pagination.totalItems}
                    itemsPerPage={reportData.pagination.itemsPerPage}
                    onPageChange={(page) => setCurrentPage(page)}
                    onPageSizeChange={(size) => {
                        setPageSize(size);
                        setCurrentPage(1);
                    }}
                />
            )}
        </div>
    )
}
