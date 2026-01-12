"use client";

import { Container } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { useLoginModal } from "@/hooks/useLoginModal";
import {
  CoursePopulated,
  useGetChaptersQuery,
  useGetCourseByIdQuery,
  useGetLessonsQuery,
} from "@/store/api/courseApi";
import { useAppSelector } from "@/store/hooks";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { CourseHeader } from "./shared/CourseHeader";
import { CourseStatsCard } from "./shared/CourseStatsCard";
import { CourseOutline } from "./shared/CourseOutline";

interface CourseDetailClientProps {
  courseId: string | null;
  error?: string | null;
}

export function CourseDetailClient({
  courseId,
  error: propError,
}: CourseDetailClientProps) {
  // Use RTK Query to fetch course data
  const {
    data: courseData,
    isLoading,
    error: queryError,
  } = useGetCourseByIdQuery(courseId!, {
    skip: !courseId, // Skip query if courseId is null
  });

  // Fetch chapters and lessons separately
  const { data: chaptersData, isLoading: isLoadingChapters } =
    useGetChaptersQuery({ courseId: courseId || "" }, { skip: !courseId });

  const { data: lessonsData, isLoading: isLoadingLessons } = useGetLessonsQuery(
    { courseId: courseId || "" },
    { skip: !courseId }
  );

  const course = (courseData?.data?.course || {}) as Partial<CoursePopulated>;
  const error =
    propError || (queryError ? "Failed to fetch course data" : null);

  const router = useRouter();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const { openLoginModal } = useLoginModal();

  const handleContinueCourse = () => {
    if (!isAuthenticated) {
      openLoginModal(
        "Please sign in to enroll in this course and access lessons."
      );
      return;
    }
    if (course?._id) {
      router.push(`/courses/${course._id}/learn`);
    }
  };

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

  const isLoadingData = isLoading || isLoadingChapters || isLoadingLessons;

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-off-white-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-info mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course details...</p>
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

  // TODO: Fetch enrollment data when user is authenticated and enrolled
  // For now, passing null - will show preview mode stats
  const enrollment = null;

  return (
    <Container size="xl" padding="sm" className="bg-white">
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

        <div className="flex flex-col md:flex-row flex-9 justify-between">
          {/* Left - Course Header */}
          <CourseHeader
            course={course}
            chapters={chapters}
            totalLessons={totalLessons}
            actionButtons={
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium"
                onClick={handleContinueCourse}
              >
                Enroll Now
              </Button>
            }
          />

          {/* Right - Stats Card */}
          <CourseStatsCard
            course={course}
            totalLessons={totalLessons}
            enrollment={enrollment}
            mode="detail"
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
          mode="detail"
        />

        <div className="flex-1 hidden md:flex"></div>
      </div>
    </Container>
  );
}
