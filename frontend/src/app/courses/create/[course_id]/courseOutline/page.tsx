"use client";

import CourseOutline from "@/components/courses/course_create/CourseOutline";
import { useGetCourseByIdQuery } from "@/store/api/courseApi";
import { use } from "react";

export default function CourseOutlinePage({
  params,
}: {
  params: Promise<{ course_id: string }>;
}) {
  // Unwrap params Promise for Next.js 15 compatibility
  const { course_id } = use(params);

  const { data: courseData, isLoading } = useGetCourseByIdQuery(course_id);
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
