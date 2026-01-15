"use client";

import CourseOutline from "@/components/courses/course_create/CourseOutline";
import { useGetCourseByIdQuery } from "@/store/api/courseApi";

export default function CourseOutlinePage({
  params,
}: {
  params: { course_id: string };
}) {
  const { data: courseData, isLoading } = useGetCourseByIdQuery(
    params.course_id
  );
  const course = courseData?.data?.course;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-gray-100 animate-pulse rounded-lg h-16"
          ></div>
        ))}
      </div>
    );
  }

  return <CourseOutline course={course} />;
}
