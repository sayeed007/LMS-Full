"use client"

import ArticlesGrid from "@/components/articles/articles-grid";
import { CreateArticleModal } from "@/components/articles/create-article-modal";
import { EmptyStateWithCreate } from "@/components/EmptyStateWithCreate";
import { PageLayout, SearchInput, TabNav } from "@/components/ui";
import { useState } from "react";
import { useGetArticlesQuery, useGetMyArticlesQuery } from "@/store/api/articleApi";
import { useSession } from "next-auth/react";
import LoginModal from "@/components/auth/LoginModal";

const tabs = [
    { key: "my", label: "My Articles" },
    { key: "all", label: "All Articles" }
];

export default function ArticlesPage() {
    const { data: session, status } = useSession();
    const [activeTab, setActiveTab] = useState<"my" | "all">("all"); // Default to "all" for unauthenticated users
    const [searchQuery, setSearchQuery] = useState("");
    const [openCreateArticleModal, setOpenCreateArticleModal] = useState<boolean>(false);
    const [showLoginModal, setShowLoginModal] = useState(false);

    // Fetch data to determine if articles exist
    const { data: myArticlesData } = useGetMyArticlesQuery({}, { skip: activeTab !== "my" || !session });
    const { data: allArticlesData } = useGetArticlesQuery({}, { skip: activeTab !== "all" });

    // Determine if there are articles based on the active tab
    const hasArticles = activeTab === "my"
        ? (myArticlesData?.data?.length ?? 0) > 0
        : (allArticlesData?.data?.length ?? 0) > 0;

    const handleCreateNewArticle = () => {
        if (!session) {
            setShowLoginModal(true);
            return;
        }
        setOpenCreateArticleModal(true);
    };

    const handleTabChange = (tab: string) => {
        if (tab === "my" && !session) {
            setShowLoginModal(true);
            return;
        }
        setActiveTab(tab as "my" | "all");
    };

    return (
        <>
            {openCreateArticleModal &&
                <CreateArticleModal
                    isOpen={openCreateArticleModal}
                    onClose={() => setOpenCreateArticleModal(false)}
                />
            }

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
                            isAuthenticated={!!session}
                        />
                        :
                        <EmptyStateWithCreate
                            message="No article to show"
                            description="Article you’ve created will show up here."
                            buttonText="Create Now"
                            onClick={handleCreateNewArticle}
                        />
                    }
                </div>
            </PageLayout>

            {/* Login Modal */}
            <LoginModal
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                title="Sign in to continue"
                message={activeTab === "my"
                    ? "You need to sign in to view your articles."
                    : "You need to sign in to create articles."
                }
            />
        </>
    )
}