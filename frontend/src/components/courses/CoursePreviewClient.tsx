"use client";

import { Container } from "@/components/ui";
import { AvatarWithDate } from "@/components/ui/AvatarWithDate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CoursePopulated, useGetChaptersQuery, useGetCourseByIdQuery, useGetLessonsQuery } from "@/store/api/courseApi";
import { BookOpen, ChevronDown, ChevronRight, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { LessonItemRenderer } from "./preview/LessonItemRenderer";

interface CoursePreviewClientProps {
  courseId: string | null;
  error?: string | null;
}

export function CoursePreviewClient({ courseId, error: propError }: CoursePreviewClientProps) {
  // Use RTK Query to fetch course data
  const {
    data: courseData,
    isLoading: isCourseLoading,
    error: courseError
  } = useGetCourseByIdQuery(courseId!, {
    skip: !courseId,
  });

  // Fetch chapters and lessons separately like in CourseOutline
  const {
    data: chaptersData,
    isLoading: isLoadingChapters,
    error: chaptersError
  } = useGetChaptersQuery(
    { courseId: courseId || "" },
    { skip: !courseId }
  );

  const {
    data: lessonsData,
    isLoading: isLoadingLessons,
    error: lessonsError
  } = useGetLessonsQuery(
    { courseId: courseId || "" },
    { skip: !courseId }
  );

  const course = (courseData?.data?.course || {}) as Partial<CoursePopulated>;
  const error = propError || (courseError ? 'Failed to fetch course data' : null);

  const [expandedChapters, setExpandedChapters] = useState<string[]>([]);
  const [expandedLessons, setExpandedLessons] = useState<string[]>([]);
  const router = useRouter();

  // Process chapters and lessons like in CourseOutline
  const chapters = useMemo(() => {
    const chapterList = chaptersData?.data?.chapters || [];
    return [...chapterList].sort((a, b) => (a?.order || 0) - (b?.order || 0)).map(chapter => ({
      ...chapter,
      lessons: chapter.lessons ? [...chapter.lessons].sort((a, b) => (a?.order || 0) - (b?.order || 0)) : []
    }));
  }, [chaptersData?.data?.chapters]);

  const lessons = useMemo(() => {
    const lessonList = lessonsData?.data?.lessons || [];
    return [...lessonList].sort((a, b) => (a?.order || 0) - (b?.order || 0));
  }, [lessonsData?.data?.lessons]);

  const isLoading = isCourseLoading || isLoadingChapters || isLoadingLessons;

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters(prev =>
      prev.includes(chapterId)
        ? prev.filter(id => id !== chapterId)
        : [...prev, chapterId]
    );
  };

  const toggleLesson = (lessonId: string) => {
    setExpandedLessons(prev =>
      prev.includes(lessonId)
        ? prev.filter(id => id !== lessonId)
        : [...prev, lessonId]
    );
  };

  const handleResourceClick = (resource: CourseResource) => {
    if (resource.url) {
      window.open(resource.url, '_blank');
    }
  };

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
  const totalLessons = chapters.reduce((acc, chapter) => acc + (chapter.lessons?.length || 0), 0) +
    lessons.filter(lesson => !lesson.chapter).length;
  const completedLessons = 0; // Preview mode - no progress
  const progressPercentage = 0; // Preview mode - no progress

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
              <h3 className="font-semibold text-blue-900">Course Preview Mode</h3>
              <p className="text-sm text-blue-700">This is how students will see your course</p>
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
          {/* Left - Details */}
          <div className="flex-3">
            {/* Rating and Title */}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-1 bg-black px-2 py-1 rounded-3xl text-sm font-medium">
                <span className="text-orange-600">★</span>
                <span className="text-white">{course.rating?.average?.toFixed(1) || "4.5"}</span>
              </div>
            </div>

            <h1 className="text-xl font-bold text-gray-900 mb-4">
              {course.title || "Course Title"}
            </h1>

            {/* Author Info */}
            <AvatarWithDate
              name={course.instructor?.name}
              avatar={course.instructor?.avatar}
              date={course.createdAt || ""}
              size="lg"
              className="mb-4"
            />

            {/* Description */}
            <div className="space-y-4 mb-4">
              <p className="text-gray-700 leading-relaxed line-clamp-2">
                {course.description || "Course description will appear here"}
              </p>
              {course.description && (
                <button className="text-blue-600 font-medium hover:underline">
                  Read More
                </button>
              )}
            </div>

            {/* Course Stats */}
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>{chapters?.length || 0} Chapter{(chapters?.length || 0) !== 1 ? 's' : ''}</span>
              </div>
              <span className="text-gray-400">|</span>
              <div className="flex items-center gap-2">
                <span>{totalLessons || 0} Lesson{totalLessons !== 1 ? 's' : ''}</span>
              </div>
              <span className="text-gray-400">|</span>
              <div className="flex items-center gap-2">
                <span>{course.stats?.totalQuizzes || 0} Quiz{(course.stats?.totalQuizzes || 0) !== 1 ? 'zes' : ''}</span>
              </div>
              <span className="text-gray-400">|</span>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{course.duration || 0} Hours</span>
              </div>
              <span className="text-gray-400">|</span>
              <Badge className="bg-green-100 text-green-800 border-green-200 capitalize">
                {course.level || "Beginner"}
              </Badge>
            </div>

            {/* Action Buttons */}
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
          </div>

          {/* Right Stats Card */}
          <div className="lg:w-96 flex flex-2 items-center mt-4 md:mt-0">
            <div className="text-white rounded-2xl p-4 relative overflow-hidden bg-cover bg-center min-h-[300px] w-full flex flex-col justify-between"
              style={{ backgroundImage: `url(${course?.thumbnail || '/default-course-thumbnail.jpg'})` }}
            >
              {/* Category Badge */}
              <div className="flex justify-end items-start mb-4">
                <Badge className="bg-white text-black border-white/30">
                  {course.category || "Category"}
                </Badge>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center border-r-1 border-white">
                  <div className="text-md font-bold mb-1">0%</div>
                  <div className="text-base text-gray-300">Completed</div>
                </div>
                <div className="text-center border-r-1 border-white">
                  <div className="text-md font-bold mb-1">--</div>
                  <div className="text-base text-gray-300">Time Left</div>
                </div>
                <div className="text-center">
                  <div className="text-md font-bold mb-1">{totalLessons}</div>
                  <div className="text-base text-gray-300">Lessons</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 hidden md:flex"></div>
      </div>

      {/* Course Outline Section */}
      <div className="flex mt-6">
        <div className="flex-1 hidden md:flex"></div>

        <div className="flex-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Outline</h2>

          {/* Chapters */}
          {chapters && chapters.length > 0 && chapters.map((chapter) => {
            const isChapterExpanded = expandedChapters.includes(chapter._id);
            const chapterLessons = chapter.lessons || [];

            return (
              <div key={chapter._id} className="mb-4">
                {/* Chapter Header */}
                <div
                  className="bg-off-white-1 flex items-center justify-between p-3 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleChapter(chapter._id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 text-sm font-bold">Ch</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-900 font-medium text-lg">{chapter.title}</span>
                      <span className="text-sm text-gray-500">{chapterLessons.length} lesson{chapterLessons.length !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  {isChapterExpanded ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </div>

                {/* Lessons List */}
                {isChapterExpanded && (
                  <div className="ml-4 mt-2 space-y-2">
                    {chapterLessons.map((lesson) => (
                      <LessonItemRenderer
                        key={lesson._id}
                        lesson={{...lesson, chapterId: chapter._id}}
                        courseId={courseId || ""}
                        isInChapter={true}
                        expandedLessons={expandedLessons}
                        toggleLesson={toggleLesson}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Standalone Lessons */}
          {lessons.filter(lesson => !lesson.chapter).length > 0 && (
            <div className="space-y-2">
              {lessons.filter(lesson => !lesson.chapter).map((lesson) => (
                <LessonItemRenderer
                  key={lesson._id}
                  lesson={lesson}
                  courseId={courseId || ""}
                  isInChapter={false}
                  expandedLessons={expandedLessons}
                  toggleLesson={toggleLesson}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {(!chapters || chapters.length === 0) && (!lessons || lessons.filter(l => !l.chapter).length === 0) && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Content Yet</h3>
              <p className="text-gray-600">Add chapters and lessons to see them in the preview.</p>
            </div>
          )}
        </div>

        <div className="flex-1 hidden md:flex"></div>
      </div>
    </Container>
  );
}