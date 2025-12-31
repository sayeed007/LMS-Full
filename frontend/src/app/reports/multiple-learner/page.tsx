// app/reports/multiple-learner/page.tsx
"use client";
import { GoBackRoute } from '@/components/reports/GoBackRoute';
import { StatsCard } from '@/components/reports/StatsCard';
import { Pagination } from '@/components/reports/Pagination';
import { DateRangeFilter } from '@/components/reports/DateRangeFilter';
import { AdvancedFilters } from '@/components/reports/AdvancedFilters';
import { ProgressBar } from '@/components/reports/ProgressBar';
import { SortableTableHeader } from '@/components/reports/SortableTableHeader';
import { Button } from '@/components/ui/button';
import { ChevronRight, Download, Loader2, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
    useGetMultipleLearnersReportMutation,
    useExportMultipleLearnersCSVMutation,
    useExportMultipleLearnersPDFMutation
} from '@/store/api/reportApi';
import { toast } from 'sonner';

export default function MultipleLearnerReport() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [dateRange, setDateRange] = useState<{ start: string | null; end: string | null }>({
        start: null,
        end: null
    });
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<string>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setCurrentPage(1); // Reset to first page on search
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Fetch multiple learners report
    const [fetchReport, { data, isLoading, error }] = useGetMultipleLearnersReportMutation();

    // CSV export
    const [exportCSV, { isLoading: isExporting }] = useExportMultipleLearnersCSVMutation();

    // PDF export
    const [exportPDF, { isLoading: isExportingPDF }] = useExportMultipleLearnersPDFMutation();

    // Fetch data on mount and when search/page/date range/status/sorting changes
    useEffect(() => {
        fetchReport({
            search: debouncedSearch || undefined,
            page: currentPage,
            limit: pageSize,
            startDate: dateRange.start,
            endDate: dateRange.end,
            status: selectedStatus || undefined,
            sortBy,
            sortOrder
        });
    }, [debouncedSearch, currentPage, pageSize, dateRange, selectedStatus, sortBy, sortOrder, fetchReport]);

    const handleDateRangeChange = (startDate: string | null, endDate: string | null) => {
        setDateRange({ start: startDate, end: endDate });
        setCurrentPage(1); // Reset to first page when filter changes
    };

    const handleStatusChange = (status: string | null) => {
        setSelectedStatus(status);
        setCurrentPage(1); // Reset to first page when filter changes
    };

    const handleSort = (newSortBy: string, newSortOrder: 'asc' | 'desc') => {
        setSortBy(newSortBy);
        setSortOrder(newSortOrder);
        setCurrentPage(1); // Reset to first page when sorting changes
    };

    const reportData = data?.data;
    const summaryStats = reportData?.summaryStats;
    const learners = reportData?.learners || [];

    // Handle CSV export
    const handleExportCSV = async () => {
        try {
            const result = await exportCSV({
                search: debouncedSearch || undefined
            }).unwrap();

            const url = window.URL.createObjectURL(result);
            const link = document.createElement('a');
            link.href = url;
            link.download = `multiple-learners-report-${Date.now()}.csv`;
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
                endDate: dateRange.end,
                status: selectedStatus || undefined
            }).unwrap();

            const url = window.URL.createObjectURL(result);
            const link = document.createElement('a');
            link.href = url;
            link.download = `multiple-learners-report-${Date.now()}.pdf`;
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

    const handleLearnerClick = (learnerId: string) => {
        router.push(`/reports/individual-learner/${learnerId}`);
    };

    // Handle error
    useEffect(() => {
        if (error) {
            toast.error('Failed to load learners report');
        }
    }, [error]);

    // Loading state
    if (isLoading && !data) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600">Loading learners report...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error && !data) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <p className="text-red-600 mb-4">Failed to load learners report</p>
                    <Button onClick={() => fetchReport({})}>
                        Try Again
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
                    {/* Search Bar */}
                    <div className="relative w-[280px]">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                            type="text"
                            placeholder="Search learners..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    {isLoading && (
                        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                    )}
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Multiple Learner Report</h1>
                <div className="flex items-center gap-4">
                    <AdvancedFilters
                        showStatusFilter={true}
                        selectedStatus={selectedStatus}
                        onStatusChange={handleStatusChange}
                    />
                    <DateRangeFilter
                        onDateRangeChange={handleDateRangeChange}
                        label="Filter by Join Date"
                    />
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

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
                <StatsCard
                    iconName={'/icons/TotalLearner.png'}
                    iconAlt="TotalLearner"
                    title="Total Learners"
                    value={summaryStats?.totalLearners || 0}
                />

                <StatsCard
                    iconName={'/icons/CourseEnrolled.png'}
                    iconAlt="CourseEnrolled"
                    title="Course Enrollments"
                    value={summaryStats?.totalCourseEnrollments || 0}
                />

                <StatsCard
                    iconName={'/icons/YetToStart.png'}
                    iconAlt="YetToStart"
                    title="Yet to Start"
                    value={summaryStats?.totalYetToStart || 0}
                />

                <StatsCard
                    iconName={'/icons/InProgress.png'}
                    iconAlt="InProgress"
                    title="In Progress"
                    value={summaryStats?.totalInProgress || 0}
                />

                <StatsCard
                    iconName={'/icons/Completed.png'}
                    iconAlt="Completed"
                    title="Completed"
                    value={summaryStats?.totalCompleted || 0}
                />
            </div>

            {/* Learners Table */}
            <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
                {learners.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <p className="text-gray-600 text-lg mb-4">
                            {searchQuery ? 'No learners found matching your search' : 'No learners found'}
                        </p>
                        {searchQuery && (
                            <Button onClick={() => setSearchQuery('')} variant="outline">
                                Clear Search
                            </Button>
                        )}
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-off-white-2 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SL</th>
                                <SortableTableHeader
                                    label="Learner"
                                    sortKey="name"
                                    currentSortBy={sortBy}
                                    currentSortOrder={sortOrder}
                                    onSort={handleSort}
                                />
                                <SortableTableHeader
                                    label="Email Address"
                                    sortKey="email"
                                    currentSortBy={sortBy}
                                    currentSortOrder={sortOrder}
                                    onSort={handleSort}
                                />
                                <SortableTableHeader
                                    label="Courses Enrolled"
                                    sortKey="coursesEnrolled"
                                    currentSortBy={sortBy}
                                    currentSortOrder={sortOrder}
                                    onSort={handleSort}
                                />
                                <SortableTableHeader
                                    label="Yet to Start"
                                    sortKey="yetToStart"
                                    currentSortBy={sortBy}
                                    currentSortOrder={sortOrder}
                                    onSort={handleSort}
                                />
                                <SortableTableHeader
                                    label="In Progress"
                                    sortKey="inProgress"
                                    currentSortBy={sortBy}
                                    currentSortOrder={sortOrder}
                                    onSort={handleSort}
                                />
                                <SortableTableHeader
                                    label="Completed"
                                    sortKey="completed"
                                    currentSortBy={sortBy}
                                    currentSortOrder={sortOrder}
                                    onSort={handleSort}
                                />
                                <SortableTableHeader
                                    label="Completion %"
                                    sortKey="completionPercentage"
                                    currentSortBy={sortBy}
                                    currentSortOrder={sortOrder}
                                    onSort={handleSort}
                                />
                                <th className="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {learners.map((learner, index) => (
                                <tr
                                    key={learner._id}
                                    onClick={() => handleLearnerClick(learner._id)}
                                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {(currentPage - 1) * pageSize + index + 1}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center space-x-3">
                                            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                                                <span className="text-white text-sm font-medium">
                                                    {learner.name.split(' ').map(n => n[0]).join('')}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-blue-600">{learner.name}</p>
                                                <p className="text-xs text-gray-500">ID: {learner._id.slice(-8)}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{learner.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{learner.coursesEnrolled}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{learner.yetToStart}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{learner.inProgress}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{learner.completed}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <ProgressBar
                                            value={learner.completionPercentage}
                                            showLabel={true}
                                            height="md"
                                            className="min-w-[150px]"
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <ChevronRight className="h-5 w-5 text-gray-400" />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {reportData?.pagination && learners.length > 0 && (
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
    );
}