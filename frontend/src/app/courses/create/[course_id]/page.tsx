import { redirect } from "next/navigation";

export default async function CourseCreate({
  params,
}: {
  params: Promise<{ course_id: string }>;
}) {
  const { course_id } = await params;
  redirect(`/courses/create/${course_id}/courseOutline`);
}
