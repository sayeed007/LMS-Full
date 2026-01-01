// src\components\question-bank\QuestionBankGrid.tsx
"use client"

import { useRouter } from "next/navigation";
import PrimaryActionButton from "../ui/PrimaryButton";
import { QuestionBankCard } from "./QuestionBankCard";
import { useGetQuestionBanksQuery } from "@/store/api/questionBankApi";
import { useState } from "react";
import { showErrorToast } from "@/lib/toast-utils";
import { Pagination } from "../ui";

// Define the props interface
interface QuestionBankGridProps {
    activeTab: "my" | "all";
    searchQuery: string;
    handleCreateNewQuestion: () => void;
}

// Define the component with typed props
const QuestionBankGrid: React.FC<QuestionBankGridProps> = ({
    activeTab,
    searchQuery,
    handleCreateNewQuestion
}) => {
    const router = useRouter()
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(12) // Question banks per page

    // Build query parameters
    const queryParams = {
        my: activeTab === "my",
        page: currentPage,
        limit: pageSize,
        search: searchQuery || undefined,
        status: 'active' as const
    };

    const {
        data: questionBanksData,
        isLoading,
        error,
        refetch
    } = useGetQuestionBanksQuery(queryParams);

    // Handle error state
    if (error) {
        showErrorToast(
            'Failed to load question banks',
            'Please check your connection and try again.',
        );
    }

    const questionBanks = questionBanksData?.data?.questionBanks || [];
    const pagination = questionBanksData?.pagination;
    const totalResults = pagination?.totalResults || 0;

    const LoadingSkeleton = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm border p-6 space-y-4 animate-pulse">
                    <div className="h-32 w-full bg-gray-200 rounded-md"></div>
                    <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                    <div className="h-3 w-full bg-gray-200 rounded"></div>
                    <div className="h-3 w-2/3 bg-gray-200 rounded"></div>
                    <div className="flex justify-between items-center">
                        <div className="h-3 w-16 bg-gray-200 rounded"></div>
                        <div className="h-3 w-12 bg-gray-200 rounded"></div>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="py-6">
            {/* Header */}
            {activeTab === "my" && (
                <div className="mb-6 flex justify-between items-center">
                    <PrimaryActionButton onClick={handleCreateNewQuestion}>
                        Create Now
                    </PrimaryActionButton>

                    {totalResults > 0 && (
                        <p className="text-sm text-gray-600">
                            {totalResults} question bank{totalResults !== 1 ? 's' : ''} found
                        </p>
                    )}
                </div>
            )}

            {/* Loading State */}
            {isLoading && <LoadingSkeleton />}

            {/* Error State */}
            {error && !isLoading && (
                <div className="text-center py-12">
                    <div className="text-gray-500 mb-4">
                        Failed to load question banks
                    </div>
                    <button
                        onClick={() => refetch()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && questionBanks.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-gray-500 mb-4">
                        {searchQuery
                            ? `No question banks found matching "${searchQuery}"`
                            : activeTab === "my"
                                ? "You haven't created any question banks yet"
                                : "No question banks available"
                        }
                    </div>
                    {activeTab === "my" && (
                        <PrimaryActionButton onClick={handleCreateNewQuestion}>
                            Create Your First Question Bank
                        </PrimaryActionButton>
                    )}
                </div>
            )}

            {/* QuestionBank Grid */}
            {!isLoading && !error && questionBanks.length > 0 && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 mb-8">
                        {questionBanks.map((questionBank) => (
                            <QuestionBankCard
                                key={questionBank._id}
                                questionBank={questionBank}
                                onClick={() => {
                                    router.push(`/question-bank/${questionBank._id}`)
                                }}
                            />
                        ))}
                    </div>

                    {/* Pagination */}
                    {pagination && pagination.totalPages > 0 && (
                        <div className="mt-8">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={pagination.totalPages}
                                totalItems={pagination.totalResults}
                                itemsPerPage={pageSize}
                                onPageChange={(newPage) => setCurrentPage(newPage)}
                                onPageSizeChange={(newSize) => {
                                    setPageSize(newSize);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

export default QuestionBankGrid;