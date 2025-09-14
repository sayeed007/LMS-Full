import { Dispatch, SetStateAction } from "react";
import PageLayout from "@/components/layout/PageLayout";

interface ArticleHeaderRefactoredProps {
    activeTab: "my" | "all";
    setActiveTab: Dispatch<SetStateAction<"my" | "all">>;
    searchQuery: string;
    setSearchQuery: Dispatch<SetStateAction<string>>;
    children: React.ReactNode; // Article content goes here
}

const ArticleHeaderRefactored: React.FC<ArticleHeaderRefactoredProps> = ({
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    children
}) => {
    const tabs = [
        { key: 'my', label: 'My Article' },
        { key: 'all', label: 'All Article' }
    ];

    return (
        <PageLayout
            title="Article"
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search here"
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(tab) => setActiveTab(tab as "my" | "all")}
            tabVariant="underline"
        >
            {children}
        </PageLayout>
    );
};

export default ArticleHeaderRefactored;