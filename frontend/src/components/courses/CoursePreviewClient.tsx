"use client";

import { Container } from "@/components/ui";
import { Button } from "@/components/ui/button";
import {
  CoursePopulated,
  useGetChaptersQuery,
  useGetCourseByIdQuery,
  useGetLessonsQuery,
} from "@/store/api/courseApi";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { CourseHeader } from "./shared/CourseHeader";
import { CourseStatsCard } from "./shared/CourseStatsCard";
import { CourseOutline } from "./shared/CourseOutline";

interface CoursePreviewClientProps {
  courseId: string | null;
  error?: string | null;
}

export function CoursePreviewClient({
  courseId,
  error: propError,
}: CoursePreviewClientProps) {
  // Use RTK Query to fetch course data
  const {
    data: courseData,
    isLoading: isCourseLoading,
    error: courseError,
  } = useGetCourseByIdQuery(courseId!, {
    skip: !courseId,
  });

  // Fetch chapters and lessons separately
  const {
    data: chaptersData,
    isLoading: isLoadingChapters,
    error: chaptersError,
  } = useGetChaptersQuery({ courseId: courseId || "" }, { skip: !courseId });

  const {
    data: lessonsData,
    isLoading: isLoadingLessons,
    error: lessonsError,
  } = useGetLessonsQuery({ courseId: courseId || "" }, { skip: !courseId });

  console.info(chaptersError, lessonsError);

  const course = (courseData?.data?.course || {}) as Partial<CoursePopulated>;
  const error =
    propError || (courseError ? "Failed to fetch course data" : null);

  const router = useRouter();

  // Process chapters and lessons
  const chapters = useMemo(() => {
    const chapterList = chaptersData?.data?.chapters || [];
    return [...chapterList]
      .sort((a, b) => (a?.order || 0) - (b?.order || 0))
      .map((chapter) => ({
        ...chapter,
        lessons: chapter.lessons
          ? [...chapter.lessons].sort(
              (a, b) => (a?.order || 0) - (b?.order || 0)
            )
          : [],
      }));
  }, [chaptersData?.data?.chapters]);

  const lessons = useMemo(() => {
    const lessonList = lessonsData?.data?.lessons || [];
    return [...lessonList].sort((a, b) => (a?.order || 0) - (b?.order || 0));
  }, [lessonsData?.data?.lessons]);

  const isLoading = isCourseLoading || isLoadingChapters || isLoadingLessons;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-off-white-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-info mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course preview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-off-white-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => router.back()} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-off-white-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Course not found</p>
          <Button onClick={() => router.back()} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // Calculate course stats from chapters and lessons
  const totalLessons =
    chapters.reduce((acc, chapter) => acc + (chapter.lessons?.length || 0), 0) +
    lessons.filter((lesson) => !lesson.chapter).length;

  return (
    <Container size="xl" padding="sm" className="bg-white">
      {/* Preview Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">👁</span>
            </div>
            <div>
              <h3 className="font-semibold text-blue-900">
                Course Preview Mode
              </h3>
              <p className="text-sm text-blue-700">
                This is how students will see your course
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="border-blue-300 text-blue-700 hover:bg-blue-100"
          >
            Back to Editor
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col md:flex-row bg-off-white-3 p-4 mx-4 rounded-lg">
        <div className="flex-1">
          {/* Back Button */}
          <button
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 font-medium"
            onClick={() => router.back()}
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Back
          </button>
        </div>

        <div className="flex flex-col md:flex-row flex-8 justify-between">
          {/* Left - Course Header */}
          <CourseHeader
            course={course}
            chapters={chapters}
            totalLessons={totalLessons}
            actionButtons={
              <div className="flex items-center gap-3">
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium"
                  disabled
                >
                  Enroll Now (Preview Mode)
                </Button>
                <Button
                  variant="outline"
                  className="border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-xl font-medium"
                  onClick={() => router.push(`/courses/${courseId}/learn`)}
                >
                  Test Learning Experience
                </Button>
              </div>
            }
          />

          {/* Right - Stats Card */}
          <CourseStatsCard
            course={course}
            totalLessons={totalLessons}
            enrollment={null}
            mode="preview"
          />
        </div>

        <div className="flex-1 hidden md:flex"></div>
      </div>

      {/* Course Outline Section */}
      <div className="flex mt-6">
        <div className="flex-1 hidden md:flex"></div>

        <CourseOutline
          chapters={chapters}
          lessons={lessons}
          courseId={courseId || ""}
          mode="preview"
          title="Course Outline"
        />

        <div className="flex-1 hidden md:flex"></div>
      </div>
    </Container>
  );
}
