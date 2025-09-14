// components/question-bank/QuestionBankCard.tsx
import { cn } from "@/lib/utils"
import { Section } from "@/types"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
// import { QuestionBankCardAction } from "./QuestionBankCardAction"
import Image from "next/image"
import { Course } from "@/dummyData/courseQuestionData"

interface QuestionBankCardProps {
    questionBank: Course
    onClick?: () => void
}

export function QuestionBankCard({
    questionBank,
    onClick
}: QuestionBankCardProps) {
    const { title, description, author, isPublished, isMyCourse } = questionBank;
    const { name, avatar, initials } = author;

    const topicCount = questionBank?.sections?.length || 0;
    const questionCount = questionBank?.sections.reduce((total: number, section: Section) => total + section.questions.length, 0);


    return (
        <div
            className="bg-white rounded-2xl border-off-white-2 shadow-1 border p-4 cursor-pointer flex flex-col justify-between hover:shadow-md transition-shadow"
            onClick={onClick}
        >
            {/* Header with title and action button */}
            <div className="relative mb-3">
                <div className="flex flex-col items-start justify-between">

                    {/* Publish Status */}
                    {isMyCourse &&
                        <div className={cn(
                            "px-2 p-1 rounded-3xl text-xs whitespace-nowrap",
                            isPublished ? 'bg-off-white-5 text-white' : 'bg-warning-bg text-warning'
                        )}>
                            {isPublished ? 'Published' : 'Draft'}
                        </div>
                    }

                    <h3 className="font-semibold text-gray-900 line-clamp-2 pr-2 mt-2">
                        {title}
                    </h3>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                    <Avatar className="w-5 h-5">
                        <AvatarImage src={avatar} />
                        <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                    <span>{name}</span>
                </div>
            </div>

            {/* Content area with description or tags */}
            <div className="flex-1 mb-4">
                <div className="text-sm text-gray-600 line-clamp-2">
                    {description}
                </div>
            </div>

            {/* Footer - Stats section */}
            <div className="flex items-center justify-between gap-4 text-sm text-gray-600 pt-2 border-t-1 border-off-white-5">
                <div className="flex items-center gap-1">
                    <Image
                        src="/icons/Topic.png"
                        alt="Topic"
                        width={16}
                        height={16}
                    />
                    <span>{topicCount} Topics</span>
                </div>

                <div className="flex items-center gap-1">
                    <Image
                        src="/icons/HelpCircle.png"
                        alt="HelpCircle"
                        width={16}
                        height={16}
                    />
                    <span>{questionCount} Questions</span>
                </div>
            </div>
        </div>
    )
}