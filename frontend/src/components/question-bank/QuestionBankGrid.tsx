// src\components\question-bank\QuestionBankGrid.tsx
"use client"

import { useRouter } from "next/navigation";
import PrimaryActionButton from "../ui/PrimaryButton";
import { QuestionBankCard } from "./QuestionBankCard";
import { useGetQuestionBanksQuery } from "@/store/api/questionBankApi";
import { useState } from "react";
import { Skeleton } from "../ui/skeleton";
import { showErrorToast } from "@/lib/toast-utils";

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
    const [pageSize] = useState(12) // Question banks per page

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
    const totalResults = questionBanksData?.results || 0;

    const LoadingSkeleton = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
                    <Skeleton className="h-32 w-full rounded-md" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                    <div className="flex justify-between items-center">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-3 w-12" />
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
                                questionBank={{
                                    id: questionBank._id,
                                    title: questionBank.name,
                                    description: questionBank.description || '',
                                    courseTitle: questionBank.course.title,
                                    questionsCount: questionBank.totalQuestions,
                                    difficulty: questionBank.averageDifficulty,
                                    estimatedTime: questionBank.estimatedDuration,
                                    tags: questionBank.tags,
                                    thumbnail: questionBank.thumbnail,
                                    color: questionBank.color,
                                    status: questionBank.status,
                                    createdBy: questionBank.createdBy.name,
                                    createdAt: questionBank.createdAt,
                                    isMyCourse: true // This should be determined based on current user
                                }}
                                onClick={() => {
                                    router.push(`/question-bank/courses/${questionBank._id}/preview`)
                                }}
                            />
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalResults > pageSize && (
                        <div className="flex justify-center items-center gap-4 mt-8">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Previous
                            </button>

                            <span className="text-sm text-gray-600">
                                Page {currentPage} of {Math.ceil(totalResults / pageSize)}
                            </span>

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(Math.ceil(totalResults / pageSize), prev + 1))}
                                disabled={currentPage >= Math.ceil(totalResults / pageSize)}
                                className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

export default QuestionBankGrid;