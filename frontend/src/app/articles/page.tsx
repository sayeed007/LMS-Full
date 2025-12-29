"use client"

import ArticlesGrid from "@/components/articles/articles-grid";
import { CreateArticleModal } from "@/components/articles/create-article-modal";
import { EmptyStateWithCreate } from "@/components/EmptyStateWithCreate";
import { PageLayout, SearchInput, TabNav } from "@/components/ui";
import { useModalActions } from "@/lib/modal-utils";
import { useGetArticlesQuery, useGetMyArticlesQuery } from "@/store/api/articleApi";
import { useAppSelector } from "@/store/hooks";
import { useState, useEffect, useMemo } from "react";

const allTabs = [
    { key: "my", label: "My Articles", requiresAuth: true },
    { key: "all", label: "All Articles", requiresAuth: false }
];

export default function ArticlesPage() {
    const { openModal, closeModal } = useModalActions();

    // Get authentication state from Redux
    const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

    // Smart default tab: "all" for guests, "my" for authenticated users
    const defaultTab = useMemo(() => {
        return isAuthenticated ? "my" : "all";
    }, [isAuthenticated]);

    const [activeTab, setActiveTab] = useState<"my" | "all">(defaultTab);
    const [searchQuery, setSearchQuery] = useState("");

    // Update active tab when auth state changes
    useEffect(() => {
        // Only auto-switch if user is on "my" tab and becomes unauthenticated
        if (!isAuthenticated && activeTab === "my") {
            setActiveTab("all");
        }
    }, [isAuthenticated, activeTab]);

    // Filter tabs based on authentication status
    const tabs = useMemo(() => {
        return isAuthenticated
            ? allTabs
            : allTabs.filter(tab => !tab.requiresAuth);
    }, [isAuthenticated]);

    // Fetch data to determine if articles exist
    const { data: myArticlesData } = useGetMyArticlesQuery({}, { skip: activeTab !== "my" || !isAuthenticated });
    const { data: allArticlesData } = useGetArticlesQuery({}, { skip: activeTab !== "all" });

    // Determine if there are articles based on the active tab
    const hasArticles = activeTab === "my"
        ? (myArticlesData?.data?.length ?? 0) > 0
        : (allArticlesData?.data?.length ?? 0) > 0;

    const handleCreateNewArticle = () => {
        openModal(<CreateArticleModal onClose={() => closeModal()} />, {
            size: 'md',
            position: 'center'
        });
    };

    const handleTabChange = (tab: string) => {
        setActiveTab(tab as "my" | "all");
    };

    return (
        <>
            <PageLayout title="Articles">
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between border-b border-off-white-4 mb-0">
                        <TabNav
                            tabs={tabs}
                            activeTab={activeTab}
                            onTabChange={handleTabChange}
                        />
                        <SearchInput
                            placeholder="Search articles..."
                            value={searchQuery}
                            onChange={setSearchQuery}
                        />
                    </div>

                    {hasArticles ?
                        <ArticlesGrid
                            activeTab={activeTab}
                            searchQuery={searchQuery}
                            handleCreateNewArticle={handleCreateNewArticle}
                            isAuthenticated={isAuthenticated}
                        />
                        :
                        <EmptyStateWithCreate
                            message="No article to show"
                            description="Article you've created will show up here."
                            buttonText="Create Now"
                            onClick={handleCreateNewArticle}
                        />
                    }
                </div>
            </PageLayout>
        </>
    )
}