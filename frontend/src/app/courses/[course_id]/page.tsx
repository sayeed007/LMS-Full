import { CourseDetailClient } from "@/components/courses/CourseDetailClient";

interface PageProps {
  params: Promise<{
    course_id: string;
  }>;
}

// Server Component - handles params and passes courseId to client
export default async function CourseDetailPage({ params }: PageProps) {
  // Await the params promise
  const resolvedParams = await params;
  const courseId = resolvedParams.course_id;

  // Validate course ID
  if (!courseId) {
    return (
      <CourseDetailClient
        courseId={null}
        error="Invalid course ID"
      />
    );
  }

  // Pass courseId to client component which will handle the RTK Query
  return (
    <CourseDetailClient
      courseId={courseId}
    />
  );
}