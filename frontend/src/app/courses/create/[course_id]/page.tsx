import { redirect } from "next/navigation";

export default function CourseCreate({
  params,
}: {
  params: { course_id: string };
}) {
  redirect(`/courses/create/${params.course_id}/courseOutline`);
}
