import { CoursePreviewClient } from "@/components/courses/CoursePreviewClient";

interface PageProps {
  params: Promise<{
    course_id: string;
  }>;
}

export default async function CoursePreviewPage({ params }: PageProps) {
  const resolvedParams = await params;
  const courseId = resolvedParams.course_id;

  if (!courseId) {
    return (
      <CoursePreviewClient
        courseId={null}
        error="Invalid course ID"
      />
    );
  }

  return (
    <CoursePreviewClient
      courseId={courseId}
    />
  );
}