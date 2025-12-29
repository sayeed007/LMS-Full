"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGetChaptersQuery, useGetCourseByIdQuery, useGetLessonsQuery } from "@/store/api/courseApi";
import { CourseLesson } from "@/types/backend-models";
import { ArrowLeft, BookOpen, CheckCircle, ChevronRight, Circle, Clock, Download, FileText, Headphones, Menu, Video, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CourseProgress } from "./learning/CourseProgress";
import { LessonContentRenderer, useContentItems } from "./learning/LessonContentRenderer";

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
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [currentContentIndex, setCurrentContentIndex] = useState(0);
  const [completedContentItems, setCompletedContentItems] = useState<Set<string>>(new Set());


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

  // Fetch content items for current lesson
  const { contentItems } = useContentItems(courseId || '', currentLessonId || '');

  // Reset content index when lesson changes
  useEffect(() => {
    setCurrentContentIndex(0);
  }, [currentLessonId]);

  // Get icon for content type
  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-3 h-3" />;
      case 'audio':
        return <Headphones className="w-3 h-3" />;
      case 'text':
        return <FileText className="w-3 h-3" />;
      case 'document':
        return <Download className="w-3 h-3" />;
      case 'block':
        return <BookOpen className="w-3 h-3" />;
      default:
        return <FileText className="w-3 h-3" />;
    }
  };

  // Toggle chapter expansion
  const toggleChapter = (chapterId: string) => {
    setExpandedChapters(prev => {
      const newSet = new Set(prev);
      if (newSet.has(chapterId)) {
        newSet.delete(chapterId);
      } else {
        newSet.add(chapterId);
      }
      return newSet;
    });
  };

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

  // Auto-expand chapter containing current lesson
  useEffect(() => {
    if (currentChapterId && !expandedChapters.has(currentChapterId)) {
      setExpandedChapters(prev => new Set([...prev, currentChapterId]));
    }
  }, [currentChapterId, expandedChapters]);

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
    <div className="h-screen bg-gray-50 flex relative overflow-hidden">

      {/* Sidebar */}
      <div className={`${sidebarOpen
        ? 'w-80 lg:w-96'
        : 'w-0 lg:w-0'
        } transition-all duration-300 ease-in-out border-r border-gray-200 flex-shrink-0 overflow-hidden z-50 lg:relative absolute lg:z-auto h-full`}>

        <div className="h-full flex flex-col bg-gradient-to-br from-[#D3E3FF] to-[#F3FFED] relative">

          {/* Header */}
          <div className="p-4 border-b border-gray-200 bg-white/50 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/courses/${courseId}`)}
                className="text-gray-600 hover:text-gray-900 hover:bg-white/80"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden hover:bg-white/80"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Course Outline */}
          <div className="flex-1 overflow-hidden flex flex-col p-4">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4 px-2 flex-shrink-0">Course Content</h2>

            <div className="flex-1 overflow-y-auto overflow-x-clip space-y-4 pb-4">
              {/* Chapters */}
              {chapters.length > 0 ? (
                chapters.map((chapter) => {
                  const isExpanded = expandedChapters.has(chapter._id);

                  return (
                    <div key={chapter._id} className="space-y-2">
                      <button
                        onClick={() => toggleChapter(chapter._id)}
                        className="w-full flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-100/60 to-purple-100/60 rounded-lg backdrop-blur-sm border border-blue-200/50 shadow-sm hover:shadow-md transition-all duration-200 hover:from-blue-100 hover:to-purple-100"
                      >
                        <ChevronRight
                          className={`w-4 h-4 text-blue-700 transition-transform duration-200 flex-shrink-0 ${isExpanded ? 'rotate-90' : ''}`}
                        />
                        <BookOpen className="w-4 h-4 text-blue-700 flex-shrink-0" />
                        <span className="font-semibold text-gray-900 text-sm flex-1 text-left">
                          {chapter.title}
                        </span>
                        <Badge variant="secondary" className="bg-white/80 text-blue-700 text-xs font-medium flex-shrink-0">
                          {chapter.lessons?.length || 0}
                        </Badge>
                      </button>

                      {isExpanded && chapter.lessons?.map((lesson) => {
                        const isCompleted = completedLessons.has(lesson._id);
                        const isCurrent = currentLessonId === lesson._id;

                        return (
                          <div key={lesson._id} className="space-y-1">
                            <button
                              onClick={() => goToLesson(lesson._id, chapter._id)}
                              className={`w-full flex items-center gap-3 px-4 py-3 ml-2 rounded-lg text-left transition-all duration-200 border ${isCurrent
                                ? 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-300 text-blue-900 shadow-md scale-[1.02]'
                                : 'bg-white/70 backdrop-blur-sm border-gray-200 hover:bg-white hover:shadow-md hover:scale-[1.01] hover:border-blue-200 transform'
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
                                  <Clock className="w-3 h-3 text-gray-500" />
                                  <span className="text-xs text-gray-600">
                                    {lesson.estimatedDuration || 0} min
                                  </span>
                                </div>
                              </div>
                            </button>

                            {/* Content Items for Current Lesson */}
                            {isCurrent && contentItems.length > 0 && (
                              <div className="ml-6 space-y-1 mt-2">
                                {contentItems.map((contentItem, index) => {
                                  const isContentCompleted = completedContentItems.has(contentItem._id);
                                  const isContentCurrent = index === currentContentIndex;

                                  return (
                                    <button
                                      key={contentItem._id}
                                      onClick={() => setCurrentContentIndex(index)}
                                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-left transition-all duration-200 text-xs ${isContentCurrent
                                        ? 'bg-blue-500 text-white shadow-sm'
                                        : isContentCompleted
                                          ? 'bg-green-50 text-green-700 hover:bg-green-100'
                                          : 'bg-white/50 text-gray-700 hover:bg-white/80'
                                        }`}
                                    >
                                      {isContentCompleted && !isContentCurrent && (
                                        <CheckCircle className="w-3 h-3 flex-shrink-0" />
                                      )}
                                      {getContentIcon(contentItem.type)}
                                      <span className="truncate flex-1">
                                        {contentItem.title || `${contentItem.type.charAt(0).toUpperCase() + contentItem.type.slice(1)} ${index + 1}`}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No chapters available</p>
                </div>
              )}

              {/* Standalone Lessons */}
              {lessons.filter(lesson => !lesson.chapter).length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-100/60 to-blue-100/60 rounded-lg backdrop-blur-sm border border-purple-200/50 shadow-sm">
                    <BookOpen className="w-4 h-4 text-purple-700" />
                    <span className="font-semibold text-gray-900 text-sm flex-1">
                      Additional Lessons
                    </span>
                  </div>

                  {lessons.filter(lesson => !lesson.chapter).map((lesson) => {
                    const isCompleted = completedLessons.has(lesson._id);
                    const isCurrent = currentLessonId === lesson._id;

                    return (
                      <div key={lesson._id} className="space-y-1">
                        <button
                          onClick={() => goToLesson(lesson._id)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 border ${isCurrent
                            ? 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-300 text-blue-900 shadow-md scale-[1.02]'
                            : 'bg-white/70 backdrop-blur-sm border-gray-200 hover:bg-white hover:shadow-md hover:scale-[1.01] hover:border-blue-200 transform'
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
                              <Clock className="w-3 h-3 text-gray-500" />
                              <span className="text-xs text-gray-600">
                                {lesson.estimatedDuration || 0} min
                              </span>
                            </div>
                          </div>
                        </button>

                        {/* Content Items for Current Lesson */}
                        {isCurrent && contentItems.length > 0 && (
                          <div className="ml-4 space-y-1 mt-2">
                            {contentItems.map((contentItem, index) => {
                              const isContentCompleted = completedContentItems.has(contentItem._id);
                              const isContentCurrent = index === currentContentIndex;

                              return (
                                <button
                                  key={contentItem._id}
                                  onClick={() => setCurrentContentIndex(index)}
                                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-left transition-all duration-200 text-xs ${isContentCurrent
                                    ? 'bg-blue-500 text-white shadow-sm'
                                    : isContentCompleted
                                      ? 'bg-green-50 text-green-700 hover:bg-green-100'
                                      : 'bg-white/50 text-gray-700 hover:bg-white/80'
                                    }`}
                                >
                                  {isContentCompleted && !isContentCurrent && (
                                    <CheckCircle className="w-3 h-3 flex-shrink-0" />
                                  )}
                                  {getContentIcon(contentItem.type)}
                                  <span className="truncate flex-1">
                                    {contentItem.title || `${contentItem.type.charAt(0).toUpperCase() + contentItem.type.slice(1)} ${index + 1}`}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>


          {/* Course Progress */}
          <div className="flex-shrink-0 m-4 p-4 bg-[#6EBC44] rounded-2xl">
            <div className="flex flex-col justify-center">
              <h1 className="text-lg font-bold text-white line-clamp-2">
                {course.title}
              </h1>

              <CourseProgress
                totalLessons={allLessons.length}
                completedLessons={Array.from(completedLessons).length}
                className="mt-4"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-2 shadow-sm flex-shrink-0">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              {!sidebarOpen && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(true)}
                  className="flex-shrink-0 hover:bg-blue-50 transition-colors"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              )}

              <div className="min-w-0">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                  {currentLesson?.title || 'Select a lesson'}
                </h2>
                {currentLesson?.chapterTitle && (
                  <p className="text-sm text-gray-600 mt-1 truncate">
                    {currentLesson.chapterTitle}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousLesson}
                disabled={!hasPreviousLesson}
                title="Previous lesson (Ctrl/Cmd + ←)"
                className="hidden sm:flex"
              >
                Previous
              </Button>
              <Button
                size="sm"
                onClick={goToNextLesson}
                disabled={!hasNextLesson}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all"
                title="Next lesson (Ctrl/Cmd + →)"
              >
                <span className="hidden sm:inline">Next Lesson</span>
                <span className="sm:hidden">Next</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {currentLesson ? (
            <LessonContentRenderer
              lessonId={currentLesson._id}
              courseId={courseId || ""}
              onComplete={() => markLessonComplete(currentLesson._id)}
              onNext={hasNextLesson ? goToNextLesson : undefined}
              currentContentIndex={currentContentIndex}
              onContentIndexChange={setCurrentContentIndex}
            />
          ) : (
            <div className="flex items-center justify-center min-h-[calc(100vh-60px)]">
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
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}