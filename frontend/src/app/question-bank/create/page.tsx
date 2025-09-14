// app/articles/create/page.tsx
import { QuestionCreation } from "@/components/question-bank/QuestionCreation"
import { Suspense } from "react"

export default function CreateQuestionBankPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <QuestionCreation />
        </Suspense>
    )
}