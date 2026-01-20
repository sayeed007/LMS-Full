import { CourseLearningClient } from "@/components/courses/CourseLearningClient";

interface PageProps {
  params: Promise<{
    course_id: string;
  }>;
  searchParams: Promise<{
    lesson?: string;
    chapter?: string;
  }>;
}

export default async function CourseLearningPage({
  params,
  searchParams,
}: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const courseId = resolvedParams.course_id;
  const lessonId = resolvedSearchParams.lesson;
  const chapterId = resolvedSearchParams.chapter;

  if (!courseId) {
    return <CourseLearningClient courseId={null} error="Invalid course ID" />;
  }

  return (
    <CourseLearningClient
      courseId={courseId}
      initialLessonId={lessonId}
      initialChapterId={chapterId}
    />
  );
}
