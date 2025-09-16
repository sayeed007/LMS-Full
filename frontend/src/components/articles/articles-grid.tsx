// components/articles/articles-grid.tsx
"use client"

import { useModalActions } from "@/lib/modal-utils";
import { useGetArticlesQuery, useGetMyArticlesQuery } from "@/store/api/articleApi";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import PrimaryActionButton from "../ui/PrimaryButton";
import { ArticleCard } from "./article-card";

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
    // const { openModal, closeModal } = useModalActions()
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize] = useState(12) // Articles per page

    // Reset page when search query or tab changes
    useMemo(() => {
        setCurrentPage(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery, activeTab]);

    // Fetch articles based on active tab
    const {
        data: allArticlesData,
        isLoading: isLoadingAll,
        error: errorAll
    } = useGetArticlesQuery(
        {
            search: searchQuery || undefined,
            page: currentPage,
            limit: pageSize
        },
        { skip: activeTab === "my" }
    );

    const {
        data: myArticlesData,
        isLoading: isLoadingMy,
        error: errorMy
    } = useGetMyArticlesQuery(
        {
            search: searchQuery || undefined,
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
    const error = activeTab === "my" ? errorMy : errorAll;



    // Loading state
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

            {/* Articles Grid */}
            {articles.length === 0 ? (
                <div className="flex justify-center items-center min-h-[400px]">
                    <div className="text-gray-500">
                        {searchQuery
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
                            // article={{
                            //     id: article._id,
                            //     title: article.title,
                            //     category: article.category,
                            //     author: {
                            //         name: article.author?.name,
                            //         avatar: article?.author?.avatar || "",
                            //         initials: article?.author?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || "AU"
                            //     },
                            //     publishDate: new Date(article.publishedAt || article.createdAt).toLocaleDateString(),
                            //     publishTime: new Date(article.publishedAt || article.createdAt).toLocaleTimeString(),
                            //     views: article.views,
                            //     thumbnail: article.thumbnail || `https://picsum.photos/300/200?random=${article._id}`,
                            //     myArticle: activeTab === 'my',
                            //     isPublished: article.status === 'published',
                            //     content: article.content,
                            //     votes: { yes: article.likes, no: 0 }, // Backend doesn't have downvotes, using 0
                            //     comments: [] // Would need to fetch comments separately
                            // }}
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
            {pagination && pagination.totalPages > 1 && (
                <div className="mt-8 flex justify-center items-center gap-4">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={!pagination.hasPrevPage}
                        className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>

                    <div className="flex items-center gap-2">
                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                            let pageNum;
                            if (pagination.totalPages <= 5) {
                                pageNum = i + 1;
                            } else if (currentPage <= 3) {
                                pageNum = i + 1;
                            } else if (currentPage >= pagination.totalPages - 2) {
                                pageNum = pagination.totalPages - 4 + i;
                            } else {
                                pageNum = currentPage - 2 + i;
                            }

                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={`px-3 py-2 text-sm font-medium rounded-md ${currentPage === pageNum
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                        disabled={!pagination.hasNextPage}
                        className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>

                    <div className="ml-4 text-sm text-gray-700">
                        Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, pagination.totalResults)} of {pagination.totalResults} articles
                    </div>
                </div>
            )}

        </div>
    )
}

export default ArticlesGrid;