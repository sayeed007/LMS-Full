// app/question-bank/page.tsx
"use client"

import { EmptyStateWithCreate } from "@/components/EmptyStateWithCreate";
import QuestionBankGrid from "@/components/question-bank/QuestionBankGrid";
import QuestionBankHeader from "@/components/question-bank/QuestionBankHeader";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function QuestionBankPage() {
    const router = useRouter();

    const [hasQuestions, setHasQuestions] = useState(false);
    const [activeTab, setActiveTab] = useState<"my" | "all">("my");
    const [searchQuery, setSearchQuery] = useState("");

    // Check if user has questions - replace with your actual logic
    useEffect(() => {
        // For demo purposes, set to true to show the grid
        // Set to false to show empty state
        setHasQuestions(true);
    }, []);


    const handleCreateNewQuestion = () => {
        router.push(`/question-bank/courses/${1}/sections/${1}/questions`);
    };

    return (
        <>
            <QuestionBankHeader
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
            />

            {hasQuestions ?
                <QuestionBankGrid
                    activeTab={activeTab}
                    searchQuery={searchQuery}
                    handleCreateNewQuestion={handleCreateNewQuestion}
                />
                :
                <EmptyStateWithCreate
                    message="No question to show"
                    description="Questions you’ve created will show up here."
                    buttonText="Create Now"
                    onClick={handleCreateNewQuestion}
                />
            }

        </>
    )
}