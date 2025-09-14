"use client";
import { useState } from "react";
import { ArticleCard, Article } from "@/components/ArticleCard";
import { CreateArticleModal } from "@/components/CreateArticleModal";

const initialArticles: Article[] = [
    {
        id: "1",
        title: "Article on basic guideline of Human Centered Design",
        author: "Sufian Huzaif",
        date: "Apr 24, 2024",
        views: 125,
        thumbnail: "/Thumbnail.png",
    },
];

export default function ArticlePage() {
    const [tab, setTab] = useState<"my" | "all">("my");
    const [articles, setArticles] = useState<Article[]>(initialArticles);
    const [showCreate, setShowCreate] = useState(false);

    const handleCreateArticle = (article: Omit<Article, "id">) => {
        setArticles((prev) => [...prev, { ...article, id: Date.now().toString() }]);
        setShowCreate(false);
    };

    return (
        <div className="max-w-6xl mx-auto py-10 px-4">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-dark">Article</h1>
                <button
                    className="bg-info text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-info/90 transition"
                    onClick={() => setShowCreate(true)}
                >
                    Create Now
                </button>
            </div>
            <div className="flex gap-8 mb-6 border-b border-off-white-4">
                <button
                    className={`pb-2 font-semibold text-lg ${tab === "my" ? "text-dark border-b-2 border-info" : "text-grey-2"}`}
                    onClick={() => setTab("my")}
                >
                    My Article
                </button>
                <button
                    className={`pb-2 font-semibold text-lg ${tab === "all" ? "text-dark border-b-2 border-info" : "text-grey-2"}`}
                    onClick={() => setTab("all")}
                >
                    All Article
                </button>
            </div>
            {articles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="text-grey-2 text-lg mb-4">No article to show</div>
                    <button
                        className="bg-info text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-info/90 transition"
                        onClick={() => setShowCreate(true)}
                    >
                        Create Now
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                    {articles.map((article) => (
                        <ArticleCard key={article.id} article={article} />
                    ))}
                </div>
            )}
            <CreateArticleModal
                open={showCreate}
                onOpenChange={setShowCreate}
                onCreate={handleCreateArticle}
            />
        </div>
    );
} 