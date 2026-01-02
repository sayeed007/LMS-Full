// app/question-bank/[id]/page.tsx - Question Bank Detail Page

import { QuestionBankDetailClient } from "@/components/question-bank/QuestionBankDetailClient";

interface QuestionBankPageProps {
    params: Promise<{
        id: string
    }>;
}

export default async function QuestionBankPage({ params }: QuestionBankPageProps) {
    const resolvedParams = await params;

    return <QuestionBankDetailClient questionBankId={resolvedParams.id} />
}
