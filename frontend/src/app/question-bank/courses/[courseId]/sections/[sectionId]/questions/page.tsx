// app/question-bank/courses/[courseId]/sections/[sectionId]/questions/page.tsx - Server Component

import { QuestionsPageClient } from "@/components/question-bank/QuestionsPageClient";

interface QuestionsPageProps {
  params: Promise<{
    courseId: string;
    sectionId: string;
  }>;
}

export default async function QuestionsPage({ params }: QuestionsPageProps) {
  const resolvedParams = await params;

  return (
    <QuestionsPageClient
      questionBankId={resolvedParams.courseId}
      sectionId={resolvedParams.sectionId}
    />
  );
}
