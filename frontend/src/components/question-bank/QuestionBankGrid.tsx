// src\components\question-bank\QuestionBankGrid.tsx
"use client"

import { courseQuestionData } from "@/dummyData/courseQuestionData";
import { useRouter } from "next/navigation";
import PrimaryActionButton from "../ui/PrimaryButton";
import { QuestionBankCard } from "./QuestionBankCard";

// Sample data - replace with your actual data source
const sampleQuestionBank = [...courseQuestionData];

// Define the props interface
interface QuestionBankGridProps {
    activeTab: "my" | "all";
    searchQuery: string;
    handleCreateNewQuestion: () => void;
}

// Define the component with typed props
const QuestionBankGrid: React.FC<QuestionBankGridProps> = ({
    activeTab,
    searchQuery,
    handleCreateNewQuestion
}) => {
    const router = useRouter()

    const filteredQuestionBank = sampleQuestionBank.filter((questionBank) => {
        // Check if questionBank matches the activeTab condition
        const matchesTab = activeTab === "my" ? questionBank.isMyCourse : true;

        // Check if questionBank matches the searchQuery (case-insensitive)
        const matchesSearch = searchQuery
            ? questionBank.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            questionBank.description.toLowerCase().includes(searchQuery.toLowerCase())
            : true;

        // Return true only if both conditions are met
        return matchesTab && matchesSearch;
    });

    console.log(filteredQuestionBank);

    return (
        <div className="py-6">
            {/* Header */}
            {activeTab === "my" &&
                <div className="mb-6">
                    <PrimaryActionButton
                        onClick={handleCreateNewQuestion}
                    >
                        Create Now
                    </PrimaryActionButton>
                </div>
            }

            {/* QuestionBank Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                {filteredQuestionBank.map((questionBank) => (
                    <QuestionBankCard
                        key={questionBank.id}
                        questionBank={questionBank}
                        onClick={() => { router.push(`/question-bank/courses/${questionBank.id}/preview`) }}
                    />
                ))}
            </div>
        </div>
    )
}

export default QuestionBankGrid;