"use client"

import QuestionBankGrid from "@/components/question-bank/QuestionBankGrid";
import { QuestionBankDialog } from "@/components/question-bank/QuestionBankDialog";
import { PageLayout, TabNav, SearchInput } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";

const tabs = [
    { key: "my", label: "My Questions" },
    { key: "all", label: "All Questions" }
];

export default function QuestionBankPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"my" | "all">("my");
    const [searchQuery, setSearchQuery] = useState("");
    const [showCreateDialog, setShowCreateDialog] = useState(false);

    return (
        <PageLayout
            title="Question Bank"
            headerActions={
                <Button
                    onClick={() => setShowCreateDialog(true)}
                    className="bg-info text-white px-6 py-2 font-medium hover:bg-info/90 transition"
                >
                    Create Question Bank
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
                        placeholder="Search question banks..."
                        value={searchQuery}
                        onChange={setSearchQuery}
                    />
                </div>

                <QuestionBankGrid
                    activeTab={activeTab}
                    searchQuery={searchQuery}
                />
            </div>

            {/* Create Question Bank Dialog */}
            <QuestionBankDialog
                isOpen={showCreateDialog}
                onClose={() => setShowCreateDialog(false)}
                onSuccess={(questionBankId) => {
                    setShowCreateDialog(false)
                    // Navigate to the newly created question bank
                    router.push(`/question-bank/${questionBankId}`)
                }}
                mode="create"
            />
        </PageLayout>
    )
}