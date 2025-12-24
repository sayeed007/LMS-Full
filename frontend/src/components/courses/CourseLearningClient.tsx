"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGetChaptersQuery, useGetCourseByIdQuery, useGetLessonsQuery } from "@/store/api/courseApi";
import { CourseLesson } from "@/types/backend-models";
import { ArrowLeft, BookOpen, CheckCircle, Circle, Clock, Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CourseProgress } from "./learning/CourseProgress";
import { LessonContentRenderer } from "./learning/LessonContentRenderer";

interface CourseLearningClientProps {
  courseId: string | null;
  initialLessonId?: string;
  initialChapterId?: string;
  error?: string | null;
}

export function CourseLearningClient({
  courseId,
  initialLessonId,
  initialChapterId,
  error: propError
}: CourseLearningClientProps) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(initialLessonId || null);
  const [currentChapterId, setCurrentChapterId] = useState<string | null>(initialChapterId || null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());


  // Fetch course data
  const {
    data: courseData,
    isLoading: isCourseLoading,
    error: courseError
  } = useGetCourseByIdQuery(courseId!, {
    skip: !courseId,
  });

  const {
    data: chaptersData,
    isLoading: isLoadingChapters,
  } = useGetChaptersQuery(
    { courseId: courseId || "" },
    { skip: !courseId }
  );

  const {
    data: lessonsData,
    isLoading: isLoadingLessons,
  } = useGetLessonsQuery(
    { courseId: courseId || "" },
    { skip: !courseId }
  );

  const course = courseData?.data?.course;
  const error = propError || (courseError ? 'Failed to fetch course data' : null);

  // Process chapters and lessons
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

  // Get all lessons in order (chapters first, then standalone)
  const allLessons = useMemo(() => {
    const orderedLessons: (CourseLesson & { chapterTitle: string | null; chapterId: string | null })[] = [];

    // Add lessons from chapters
    chapters.forEach(chapter => {
      if (chapter.lessons) {
        chapter.lessons.forEach(lesson => {
          orderedLessons.push({ ...lesson, chapterTitle: chapter.title, chapterId: chapter._id });
        });
      }
    });

    // Add standalone lessons
    lessons.filter(lesson => !lesson.chapter).forEach(lesson => {
      orderedLessons.push({ ...lesson, chapterTitle: null, chapterId: null });
    });

    return orderedLessons;
  }, [chapters, lessons]);

  // Navigation functions
  const goToLesson = (lessonId: string, chapterId?: string) => {
    setCurrentLessonId(lessonId);
    setCurrentChapterId(chapterId || null);

    const url = `/courses/${courseId}/learn?lesson=${lessonId}${chapterId ? `&chapter=${chapterId}` : ''}`;
    window.history.pushState({}, '', url);
  };

  const goToNextLesson = useCallback(() => {
    const currentIndex = allLessons.findIndex(lesson => lesson._id === currentLessonId);
    if (currentIndex < allLessons.length - 1) {
      const nextLesson = allLessons[currentIndex + 1];
      setCurrentLessonId(nextLesson._id);
      setCurrentChapterId(nextLesson?.chapterId || null);
      const url = `/courses/${courseId}/learn?lesson=${nextLesson._id}${nextLesson?.chapterId ? `&chapter=${nextLesson.chapterId}` : ''}`;
      window.history.pushState({}, '', url);
    }
  }, [allLessons, currentLessonId, courseId]);

  const goToPreviousLesson = useCallback(() => {
    const currentIndex = allLessons.findIndex(lesson => lesson._id === currentLessonId);
    if (currentIndex > 0) {
      const previousLesson = allLessons[currentIndex - 1];
      setCurrentLessonId(previousLesson._id);
      setCurrentChapterId(previousLesson?.chapterId || null);
      const url = `/courses/${courseId}/learn?lesson=${previousLesson._id}${previousLesson?.chapterId ? `&chapter=${previousLesson.chapterId}` : ''}`;
      window.history.pushState({}, '', url);
    }
  }, [allLessons, currentLessonId, courseId]);

  // Set initial lesson if not provided
  useEffect(() => {
    if (!currentLessonId && allLessons.length > 0) {
      setCurrentLessonId(allLessons[0]._id);
      if (allLessons[0].chapterId) {
        setCurrentChapterId(allLessons[0].chapterId);
      }
    }
  }, [allLessons, currentLessonId]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return;
      }

      switch (event.key) {
        case 'ArrowLeft':
          if (event.metaKey || event.ctrlKey) {
            event.preventDefault();
            goToPreviousLesson();
          }
          break;
        case 'ArrowRight':
          if (event.metaKey || event.ctrlKey) {
            event.preventDefault();
            goToNextLesson();
          }
          break;
        case 'Escape':
          if (sidebarOpen) {
            setSidebarOpen(false);
          }
          break;
        case 'm':
        case 'M':
          if (event.metaKey || event.ctrlKey) {
            event.preventDefault();
            setSidebarOpen(prev => !prev);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sidebarOpen, goToPreviousLesson, goToNextLesson]);

  // Find current lesson data
  const currentLesson = useMemo(() => {
    return allLessons.find(lesson => lesson._id === currentLessonId);
  }, [allLessons, currentLessonId]);

  const markLessonComplete = (lessonId: string) => {
    setCompletedLessons(prev => new Set([...prev, lessonId]));
  };

  const isLoading = isCourseLoading || isLoadingChapters || isLoadingLessons;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Course not found</p>
          <Button onClick={() => router.back()} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const currentLessonIndex = allLessons.findIndex(lesson => lesson._id === currentLessonId);
  const hasNextLesson = currentLessonIndex < allLessons.length - 1;
  const hasPreviousLesson = currentLessonIndex > 0;

  return (
    <div className="min-h-screen bg-gray-50 flex relative">
      {/* Sidebar */}
      <div className={`${sidebarOpen
        ? 'w-80 lg:w-80'
        : 'w-0 lg:w-0'
        } transition-all duration-300 ease-in-out bg-white border-r border-gray-200 flex-shrink-0 overflow-hidden z-50 lg:relative absolute lg:z-auto h-full`}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/courses/${courseId}`)}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <h1 className="text-lg font-bold text-gray-900 line-clamp-2">
              {course.title}
            </h1>

            <CourseProgress
              totalLessons={allLessons.length}
              completedLessons={Array.from(completedLessons).length}
              className="mt-4"
            />
          </div>

          {/* Course Outline */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {/* Chapters */}
              {chapters.map((chapter) => (
                <div key={chapter._id} className="space-y-2">
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                    <BookOpen className="w-4 h-4 text-gray-600" />
                    <span className="font-medium text-gray-900 text-sm">
                      {chapter.title}
                    </span>
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {chapter.lessons?.length || 0}
                    </Badge>
                  </div>

                  {chapter.lessons?.map((lesson) => {
                    const isCompleted = completedLessons.has(lesson._id);
                    const isCurrent = currentLessonId === lesson._id;

                    return (
                      <button
                        key={lesson._id}
                        onClick={() => goToLesson(lesson._id, chapter._id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${isCurrent
                          ? 'bg-blue-50 border border-blue-200 text-blue-900 shadow-sm scale-[1.02]'
                          : 'hover:bg-gray-50 hover:shadow-sm hover:scale-[1.01] transform'
                          }`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${isCurrent ? 'text-blue-900' : 'text-gray-900'}`}>
                            {lesson.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {lesson.estimatedDuration || 0} min
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))}

              {/* Standalone Lessons */}
              {lessons.filter(lesson => !lesson.chapter).length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                    <BookOpen className="w-4 h-4 text-gray-600" />
                    <span className="font-medium text-gray-900 text-sm">
                      Additional Lessons
                    </span>
                  </div>

                  {lessons.filter(lesson => !lesson.chapter).map((lesson) => {
                    const isCompleted = completedLessons.has(lesson._id);
                    const isCurrent = currentLessonId === lesson._id;

                    return (
                      <button
                        key={lesson._id}
                        onClick={() => goToLesson(lesson._id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${isCurrent
                          ? 'bg-blue-50 border border-blue-200 text-blue-900 shadow-sm scale-[1.02]'
                          : 'hover:bg-gray-50 hover:shadow-sm hover:scale-[1.01] transform'
                          }`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${isCurrent ? 'text-blue-900' : 'text-gray-900'}`}>
                            {lesson.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {lesson.estimatedDuration || 0} min
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {!sidebarOpen && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden hover:bg-blue-50 transition-colors"
                >
                  <Menu className="w-4 h-4" />
                </Button>
              )}

              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {currentLesson?.title || 'Select a lesson'}
                </h2>
                {currentLesson?.chapterTitle && (
                  <p className="text-sm text-gray-600 mt-1">
                    {currentLesson.chapterTitle}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousLesson}
                disabled={!hasPreviousLesson}
                title="Previous lesson (Ctrl/Cmd + ←)"
              >
                Previous
              </Button>
              <Button
                size="sm"
                onClick={goToNextLesson}
                disabled={!hasNextLesson}
                className="bg-blue-600 hover:bg-blue-700"
                title="Next lesson (Ctrl/Cmd + →)"
              >
                Next Lesson
              </Button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          {currentLesson ? (
            <LessonContentRenderer
              lessonId={currentLesson._id}
              courseId={courseId || ""}
              onComplete={() => markLessonComplete(currentLesson._id)}
              onNext={hasNextLesson ? goToNextLesson : undefined}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select a lesson to start learning
                </h3>
                <p className="text-gray-600">
                  Choose a lesson from the sidebar to begin your course.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}