"use client";

import CourseOutline from "@/components/courses/course_create/CourseOutline";
import { useGetCourseByIdQuery } from "@/store/api/courseApi";
import { use } from "react";

import { CourseOutlineSkeleton } from "@/components/courses/course_create/CourseOutlineSkeleton";

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
    return <CourseOutlineSkeleton />;
  }

  return <CourseOutline course={course} />;
}
