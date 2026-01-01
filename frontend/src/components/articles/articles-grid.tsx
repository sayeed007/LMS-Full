// components/articles/articles-grid.tsx
"use client"

import { useGetArticlesQuery, useGetMyArticlesQuery } from "@/store/api/articleApi";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import PrimaryActionButton from "../ui/PrimaryButton";
import { ArticleCard } from "./article-card";
import { Pagination } from "../ui";

// Define the props interface
interface ArticlesGridProps {
    activeTab: "my" | "all";
    searchQuery: string;
    handleCreateNewArticle: () => void;
    isAuthenticated: boolean;
}

// Define the component with typed props
const ArticlesGrid: React.FC<ArticlesGridProps> = ({
    activeTab,
    searchQuery,
    handleCreateNewArticle,
    isAuthenticated
}) => {
    const router = useRouter()
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(12) // Articles per page
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery)

    // Debounce search query - wait 500ms after user stops typing
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Reset page when debounced search query or tab changes
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchQuery, activeTab]);

    // Fetch articles based on active tab using debounced search
    const {
        data: allArticlesData,
        isLoading: isLoadingAll,
        error: errorAll,
        isFetching: isFetchingAll
    } = useGetArticlesQuery(
        {
            search: debouncedSearchQuery || undefined,
            page: currentPage,
            limit: pageSize
        },
        { skip: activeTab === "my" }
    );

    const {
        data: myArticlesData,
        isLoading: isLoadingMy,
        error: errorMy,
        isFetching: isFetchingMy
    } = useGetMyArticlesQuery(
        {
            search: debouncedSearchQuery || undefined,
            page: currentPage,
            limit: pageSize
        },
        { skip: activeTab === "all" || !isAuthenticated }
    );

    // Determine which data to use
    const { articles, pagination } = useMemo(() => {
        if (activeTab === "my") {
            return {
                articles: myArticlesData?.data || [],
                pagination: myArticlesData?.pagination
            };
        } else {
            return {
                articles: allArticlesData?.data || [],
                pagination: allArticlesData?.pagination
            };
        }
    }, [activeTab, allArticlesData, myArticlesData]);

    const isLoading = activeTab === "my" ? isLoadingMy : isLoadingAll;
    const isFetching = activeTab === "my" ? isFetchingMy : isFetchingAll;
    const error = activeTab === "my" ? errorMy : errorAll;

    // Show full loading state only on initial load
    if (isLoading) {
        return (
            <div className="py-6">
                <div className="flex justify-center items-center min-h-[400px]">
                    <div className="text-gray-500">Loading articles...</div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="py-6">
                <div className="flex justify-center items-center min-h-[400px]">
                    <div className="text-red-500">
                        Error loading articles. Please try again later.
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="py-6">
            {/* Header */}
            {activeTab === "my" && isAuthenticated &&
                <div className="mb-6">
                    <PrimaryActionButton
                        onClick={handleCreateNewArticle}
                    >
                        Create Now
                    </PrimaryActionButton>
                </div>
            }

            {/* Search indicator */}
            {isFetching && (
                <div className="mb-4 text-center">
                    <span className="text-sm text-blue-600">Searching...</span>
                </div>
            )}

            {/* Articles Grid */}
            {articles.length === 0 ? (
                <div className="flex justify-center items-center min-h-[400px]">
                    <div className="text-gray-500">
                        {debouncedSearchQuery
                            ? "No articles found matching your search."
                            : `No ${activeTab === "my" ? "your" : ""} articles found.`
                        }
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                    {articles.map((article) => (
                        <ArticleCard
                            key={article._id}
                            article={{ ...article }}
                            isMyArticle={activeTab === 'my'}
                            onClick={() => {
                                router.push(`/articles/${article._id}`)
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Pagination Controls */}
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

        </div>
    )
}

export default ArticlesGrid;