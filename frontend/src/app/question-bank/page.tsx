"use client"

import QuestionBankGrid from "@/components/question-bank/QuestionBankGrid";
import { PageLayout, TabNav, SearchInput } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";

const tabs = [
    { key: "my", label: "My Questions" },
    { key: "all", label: "All Questions" }
];

export default function QuestionBankPage() {
    const router = useRouter();

    const [activeTab, setActiveTab] = useState<"my" | "all">("my");
    const [searchQuery, setSearchQuery] = useState("");

    const handleCreateNewQuestion = () => {
        router.push(`/question-bank/courses/${1}/sections/${1}/questions`);
    };

    return (
        <PageLayout
            title="Question Bank"
            headerActions={
                <Button
                    onClick={handleCreateNewQuestion}
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
                        placeholder="Search questions..."
                        value={searchQuery}
                        onChange={setSearchQuery}
                    />
                </div>

                <QuestionBankGrid
                    activeTab={activeTab}
                    searchQuery={searchQuery}
                    handleCreateNewQuestion={handleCreateNewQuestion}
                />
            </div>
        </PageLayout>
    )
}