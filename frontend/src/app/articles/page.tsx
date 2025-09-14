// app/articles/page.tsx
"use client"

import ArticleHeader from "@/components/articles/article-header";
import ArticlesGrid from "@/components/articles/articles-grid"
import { CreateArticleModal } from "@/components/articles/create-article-modal";
import { EmptyStateWithCreate } from "@/components/EmptyStateWithCreate"
import { useEffect, useState } from "react"

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
            <ArticleHeader
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
            />

            {hasArticles ?
                <ArticlesGrid
                    activeTab={activeTab}
                    searchQuery={searchQuery}
                    handleCreateNewArticle={handleCreateNewArticle}
                />
                :
                <EmptyStateWithCreate
                    message="No article to show"
                    description="Article you’ve created will show up here."
                    buttonText="Create Now"
                    onClick={handleCreateNewArticle}
                />
            }
        </>
    )
}