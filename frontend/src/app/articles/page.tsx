"use client"

import ArticlesGrid from "@/components/articles/articles-grid"
import { CreateArticleModal } from "@/components/articles/create-article-modal";
import { EmptyStateWithCreate } from "@/components/EmptyStateWithCreate"
import { PageLayout, TabNav, SearchInput } from "@/components/ui"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

const tabs = [
    { key: "my", label: "My Authoring" },
    { key: "all", label: "All Articles" }
];

export default function ArticlesPage() {
    const [hasArticles, setHasArticles] = useState(false);
    const [activeTab, setActiveTab] = useState<"my" | "all">("my");
    const [searchQuery, setSearchQuery] = useState("");
    const [openCreateArticleModal, setOpenCreateArticleModal] = useState<boolean>(false);

    // Check if user has articles - replace with your actual logic
    useEffect(() => {
        // For demo purposes, set to true to show the grid
        // Set to false to show empty state
        setHasArticles(true);
    }, []);

    const handleCreateNewArticle = () => {
        setOpenCreateArticleModal(true);
    };

    return (
        <>
            {openCreateArticleModal &&
                <CreateArticleModal
                    isOpen={openCreateArticleModal}
                    onClose={() => setOpenCreateArticleModal(false)}
                />
            }
            
            <PageLayout
                title="Articles"
                actions={
                    <Button
                        onClick={handleCreateNewArticle}
                        className="bg-info text-white px-6 py-2 font-medium hover:bg-info/90 transition"
                    >
                        Create Now
                    </Button>
                }
            >
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between">
                        <TabNav
                            tabs={tabs}
                            activeTab={activeTab}
                            onTabChange={(tab) => setActiveTab(tab as "my" | "all")}
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