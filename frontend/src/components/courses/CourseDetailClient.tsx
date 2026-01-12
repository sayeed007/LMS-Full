"use client";

// import { AddChapterModal } from "@/components/AddChapterModal";
import { Container } from "@/components/ui";
import { AvatarWithDate } from "@/components/ui/AvatarWithDate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLoginModal } from "@/hooks/useLoginModal";
import {
  CoursePopulated,
  useGetChaptersQuery,
  useGetCourseByIdQuery,
  useGetLessonsQuery,
} from "@/store/api/courseApi";
import { useAppSelector } from "@/store/hooks";
import { CourseLesson, CourseResource } from "@/types/backend-models";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Clock,
  Download,
  ExternalLink,
  FileText,
  PlayCircle,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

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

  // Fetch chapters and lessons separately like in CoursePreviewClient
  const { data: chaptersData, isLoading: isLoadingChapters } =
    useGetChaptersQuery({ courseId: courseId || "" }, { skip: !courseId });

  const { data: lessonsData, isLoading: isLoadingLessons } = useGetLessonsQuery(
    { courseId: courseId || "" },
    { skip: !courseId }
  );

  const course = (courseData?.data?.course || {}) as Partial<CoursePopulated>;
  const error =
    propError || (queryError ? "Failed to fetch course data" : null);
  // const [chapters, setChapters] = useState([]);
  // const [showAdd, setShowAdd] = useState(false);
  const [expandedChapters, setExpandedChapters] = useState<string[]>([]);
  const [expandedLessons, setExpandedLessons] = useState<string[]>([]);
  const router = useRouter();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const { openLoginModal } = useLoginModal();

  // const handleAddChapter = (chapter: { name: string }) => {
  //   setChapters((prev) => [...prev, { ...chapter, id: Date.now().toString() }]);
  //   setShowAdd(false);
  // };

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

  // const handleChapterClick = (chapterId: string) => {
  //   if (course?._id) {
  //     router.push(`/courses/${course._id}/chapters/${chapterId}`);
  //   }
  // };

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters((prev) =>
      prev.includes(chapterId)
        ? prev.filter((id) => id !== chapterId)
        : [...prev, chapterId]
    );
  };

  const toggleLesson = (lessonId: string) => {
    setExpandedLessons((prev) =>
      prev.includes(lessonId)
        ? prev.filter((id) => id !== lessonId)
        : [...prev, lessonId]
    );
  };

  const handleLessonClick = (
    courseId: string,
    chapterId: string,
    lessonId: string
  ) => {
    if (!isAuthenticated) {
      openLoginModal("Please sign in to access lesson content.");
      return;
    }
    router.push(
      `/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}`
    );
  };

  const handleResourceClick = (resource: CourseResource) => {
    if (resource.url) {
      window.open(resource.url, "_blank");
    }
  };

  const handleAssignmentClick = (courseId: string, assignmentId: string) => {
    router.push(`/courses/${courseId}/assignments/${assignmentId}`);
  };

  // Get content type icon based on lesson type
  const getContentTypeIcon = (type: string) => {
    const iconMap: Record<string, string> = {
      text: "/icons/TextAa.png",
      block: "/icons/Blocks.png",
      video: "/icons/Video.png",
      audio: "/icons/Audio.png",
      document: "/icons/Document.png",
      quiz: "/icons/Quiz.png",
      assignment: "/icons/Assignment.png",
    };
    return iconMap[type] || "/icons/TextAa.png";
  };

  // Process chapters and lessons like in CoursePreviewClient
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
  // const completedLessons = 0; // TODO: Calculate from enrollment data
  // const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

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
          {/* Left - Details */}
          <div className="flex-3">
            {/* Rating and Title */}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-1 bg-black px-2 py-1 rounded-3xl text-sm font-medium">
                <span className="text-orange-600">★</span>
                <span className="text-white">
                  {course.rating?.average?.toFixed(1) || "4.5"}
                </span>
              </div>
            </div>

            <h1 className="text-xl font-bold text-gray-900 mb-4">
              {course.title || "Database for Software Developers"}
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
                {course.description || ""}
              </p>
              <button className="text-blue-600 font-medium hover:underline">
                Read More
              </button>
            </div>

            {/* Course Stats */}
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>
                  {chapters?.length || 0} Chapter
                  {(chapters?.length || 0) !== 1 ? "s" : ""}
                </span>
              </div>
              <span className="text-gray-400">|</span>
              <div className="flex items-center gap-2">
                <span>
                  {totalLessons || 0} Lesson{totalLessons !== 1 ? "s" : ""}
                </span>
              </div>
              <span className="text-gray-400">|</span>
              <div className="flex items-center gap-2">
                <span>{course.stats?.totalQuizzes || 0} Quiz&apos;s</span>
              </div>
              <span className="text-gray-400">|</span>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{course.duration || 0} Hours</span>
              </div>
              <span className="text-gray-400">|</span>
              <Badge className="bg-green-100 text-green-800 border-green-200 capitalize">
                {course.level || "Advanced"}
              </Badge>
            </div>

            {/* Enroll Button */}
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium"
              onClick={handleContinueCourse}
            >
              Enroll Now
            </Button>
          </div>

          {/* Right Stats Card */}
          <div className="lg:w-96 flex flex-2 items-center mt-4 md:mt-0">
            <div
              className="text-white rounded-2xl p-4 relative overflow-hidden bg-cover bg-center min-h-[300px] w-full flex flex-col justify-between"
              style={{
                backgroundImage: `url(${
                  course?.thumbnail || "/default-course-thumbnail.png"
                })`,
              }}
            >
              {/* Category Badge */}
              <div className="flex justify-end items-start mb-4">
                <Badge className="bg-white text-black border-white/30">
                  {course.category || "Design & Development"}
                </Badge>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center border-r-1 border-white">
                  <div className="text-md font-bold mb-1">32%</div>
                  <div className="text-base text-gray-300">Completed</div>
                </div>
                <div className="text-center border-r-1 border-white">
                  <div className="text-md font-bold mb-1">20 Days</div>
                  <div className="text-base text-gray-300">Time Left</div>
                </div>
                <div className="text-center">
                  <div className="text-md font-bold mb-1">13 Lesson</div>
                  <div className="text-base text-gray-300">Incomplete</div>
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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Course Outlines
          </h2>

          {/* Chapters */}
          {chapters &&
            chapters.length > 0 &&
            chapters.map((chapter) => {
              const isChapterExpanded = expandedChapters.includes(chapter._id);
              const chapterLessons = chapter.lessons || [];

              return (
                <div key={chapter?._id} className="mb-4">
                  {/* Chapter Header */}
                  <div
                    className="bg-off-white-1 flex items-center justify-between p-3 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleChapter(chapter?._id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 text-sm font-bold">
                          Ch
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-gray-900 font-medium text-lg">
                          {chapter?.title}
                        </span>
                        <span className="text-sm text-gray-500">
                          {chapterLessons.length} lessons
                        </span>
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
                      {chapterLessons.map((lesson: CourseLesson) => {
                        const isLessonExpanded = expandedLessons.includes(
                          lesson?._id
                        );
                        const hasResources =
                          lesson?.resources && lesson.resources.length > 0;
                        const hasAssignment = Boolean(
                          (
                            lesson as {
                              assignmentDetails?: unknown;
                              assignment?: unknown;
                            }
                          ).assignmentDetails ||
                            (
                              lesson as {
                                assignmentDetails?: unknown;
                                assignment?: unknown;
                              }
                            ).assignment
                        );
                        const hasQuiz = Boolean(
                          (lesson as { quiz?: unknown }).quiz
                        );

                        return (
                          <div
                            key={lesson?._id}
                            className="bg-white border border-gray-200 rounded-lg"
                          >
                            {/* Lesson Header */}
                            <div
                              className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                              onClick={() => toggleLesson(lesson?._id)}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-6 h-6 bg-green-100 rounded-md flex items-center justify-center">
                                  <Image
                                    src={getContentTypeIcon(
                                      (lesson as { type?: string }).type ||
                                        "text"
                                    )}
                                    alt={
                                      (lesson as { type?: string }).type ||
                                      "text"
                                    }
                                    width={16}
                                    height={16}
                                    className="object-contain"
                                  />
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-gray-900 font-medium">
                                    {lesson?.title}
                                  </span>
                                  <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <span>
                                      {(lesson as { duration?: number })
                                        .duration || 0}{" "}
                                      min
                                    </span>
                                    {(lesson as { type?: string }).type && (
                                      <>
                                        <span>•</span>
                                        <span className="capitalize">
                                          {(lesson as { type?: string }).type}
                                        </span>
                                      </>
                                    )}
                                    {(hasResources ||
                                      hasAssignment ||
                                      hasQuiz) && (
                                      <>
                                        <span>•</span>
                                        <span className="text-blue-600">
                                          {[
                                            hasResources && "Resources",
                                            hasAssignment && "Assignment",
                                            hasQuiz && "Quiz",
                                          ]
                                            .filter(Boolean)
                                            .join(", ")}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleLessonClick(
                                      course._id || "",
                                      chapter._id,
                                      lesson._id
                                    );
                                  }}
                                  className="text-blue-600 hover:bg-blue-50"
                                >
                                  Start
                                </Button>
                                {(hasResources || hasAssignment || hasQuiz) && (
                                  <>
                                    {isLessonExpanded ? (
                                      <ChevronDown className="w-4 h-4 text-gray-400" />
                                    ) : (
                                      <ChevronRight className="w-4 h-4 text-gray-400" />
                                    )}
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Lesson Content (Resources, Assignments, etc.) */}
                            {isLessonExpanded && (
                              <div className="border-t border-gray-100 p-3 bg-gray-50">
                                {/* Resources */}
                                {hasResources && (
                                  <div className="mb-3">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                                      Resources
                                    </h4>
                                    <div className="space-y-1">
                                      {lesson.resources.map(
                                        (
                                          resource: CourseResource,
                                          resourceIndex: number
                                        ) => (
                                          <div
                                            key={resourceIndex}
                                            className="flex items-center gap-2 p-2 bg-white rounded border cursor-pointer hover:bg-blue-50 transition-colors"
                                            onClick={() =>
                                              handleResourceClick(resource)
                                            }
                                          >
                                            {resource.type === "pdf" ? (
                                              <FileText className="w-4 h-4 text-red-500" />
                                            ) : resource.type === "video" ? (
                                              <PlayCircle className="w-4 h-4 text-purple-500" />
                                            ) : resource.downloadable ? (
                                              <Download className="w-4 h-4 text-green-500" />
                                            ) : (
                                              <ExternalLink className="w-4 h-4 text-blue-500" />
                                            )}
                                            <span className="text-sm text-gray-700 flex-1">
                                              {resource.title}
                                            </span>
                                            <span className="text-xs text-gray-500 capitalize">
                                              {resource.type}
                                            </span>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Assignment */}
                                {hasAssignment && (
                                  <div className="mb-3">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                                      Assignment
                                    </h4>
                                    <div
                                      className="flex items-center gap-2 p-2 bg-white rounded border cursor-pointer hover:bg-orange-50 transition-colors"
                                      onClick={() =>
                                        handleAssignmentClick(
                                          course._id || "",
                                          (lesson as { assignment?: string })
                                            .assignment || lesson._id
                                        )
                                      }
                                    >
                                      <FileText className="w-4 h-4 text-orange-500" />
                                      <div className="flex-1">
                                        <span className="text-sm text-gray-700 block">
                                          {(
                                            lesson as {
                                              assignmentDetails?: {
                                                title?: string;
                                              };
                                            }
                                          ).assignmentDetails?.title ||
                                            "Course Assignment"}
                                        </span>
                                        {(
                                          lesson as {
                                            assignmentDetails?: {
                                              dueDate?: string;
                                            };
                                          }
                                        ).assignmentDetails?.dueDate && (
                                          <span className="text-xs text-gray-500">
                                            Due:{" "}
                                            {new Date(
                                              (
                                                lesson as {
                                                  assignmentDetails?: {
                                                    dueDate?: string;
                                                  };
                                                }
                                              ).assignmentDetails?.dueDate || ""
                                            ).toLocaleDateString()}
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-xs text-orange-600">
                                        {(
                                          lesson as {
                                            assignmentDetails?: {
                                              maxScore?: number;
                                            };
                                          }
                                        ).assignmentDetails?.maxScore ||
                                          100}{" "}
                                        pts
                                      </span>
                                    </div>
                                  </div>
                                )}

                                {/* Quiz */}
                                {hasQuiz && (
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                                      Quiz
                                    </h4>
                                    <div
                                      className="flex items-center gap-2 p-2 bg-white rounded border cursor-pointer hover:bg-green-50 transition-colors"
                                      onClick={() =>
                                        router.push(
                                          `/courses/${course._id}/quizzes/${
                                            (lesson as { quiz?: unknown })?.quiz
                                          }`
                                        )
                                      }
                                    >
                                      <FileText className="w-4 h-4 text-green-500" />
                                      <span className="text-sm text-gray-700 flex-1">
                                        Lesson Quiz
                                      </span>
                                      <span className="text-xs text-green-600">
                                        Quiz
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

          {/* Standalone Lessons */}
          {lessons.filter((lesson) => !lesson.chapter).length > 0 && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Additional Lessons
              </h3>
              {lessons
                .filter((lesson) => !lesson.chapter)
                .map((lesson) => {
                  const isLessonExpanded = expandedLessons.includes(lesson._id);
                  const hasResources =
                    lesson?.resources && lesson.resources.length > 0;
                  const hasAssignment = Boolean(
                    (
                      lesson as {
                        assignmentDetails?: unknown;
                        assignment?: unknown;
                      }
                    ).assignmentDetails ||
                      (
                        lesson as {
                          assignmentDetails?: unknown;
                          assignment?: unknown;
                        }
                      ).assignment
                  );
                  const hasQuiz = Boolean((lesson as { quiz?: unknown }).quiz);

                  return (
                    <div
                      key={lesson._id}
                      className="bg-white border border-gray-200 rounded-lg"
                    >
                      {/* Lesson Header */}
                      <div
                        className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => toggleLesson(lesson._id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-green-100 rounded-md flex items-center justify-center">
                            <Image
                              src={getContentTypeIcon(
                                (lesson as { type?: string }).type || "text"
                              )}
                              alt={(lesson as { type?: string }).type || "text"}
                              width={16}
                              height={16}
                              className="object-contain"
                            />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-gray-900 font-medium">
                              {lesson.title}
                            </span>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <span>
                                {(lesson as { duration?: number }).duration ||
                                  0}{" "}
                                min
                              </span>
                              {(lesson as { type?: string }).type && (
                                <>
                                  <span>•</span>
                                  <span className="capitalize">
                                    {(lesson as { type?: string }).type}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLessonClick(
                                course._id || "",
                                "",
                                lesson._id
                              );
                            }}
                            className="text-blue-600 hover:bg-blue-50"
                          >
                            Start
                          </Button>
                          {(hasResources || hasAssignment || hasQuiz) && (
                            <>
                              {isLessonExpanded ? (
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      {/* Lesson Content (Resources, Assignments, etc.) - Reuse from chapter lessons */}
                      {isLessonExpanded &&
                        (hasResources || hasAssignment || hasQuiz) && (
                          <div className="border-t border-gray-100 p-3 bg-gray-50">
                            {/* Resources */}
                            {hasResources && (
                              <div className="mb-3">
                                <h4 className="text-sm font-medium text-gray-700 mb-2">
                                  Resources
                                </h4>
                                <div className="space-y-1">
                                  {lesson.resources.map(
                                    (
                                      resource: CourseResource,
                                      resourceIndex: number
                                    ) => (
                                      <div
                                        key={resourceIndex}
                                        className="flex items-center gap-2 p-2 bg-white rounded border cursor-pointer hover:bg-blue-50 transition-colors"
                                        onClick={() =>
                                          handleResourceClick(resource)
                                        }
                                      >
                                        {resource.type === "pdf" ? (
                                          <FileText className="w-4 h-4 text-red-500" />
                                        ) : resource.type === "video" ? (
                                          <PlayCircle className="w-4 h-4 text-purple-500" />
                                        ) : resource.downloadable ? (
                                          <Download className="w-4 h-4 text-green-500" />
                                        ) : (
                                          <ExternalLink className="w-4 h-4 text-blue-500" />
                                        )}
                                        <span className="text-sm text-gray-700 flex-1">
                                          {resource.title}
                                        </span>
                                        <span className="text-xs text-gray-500 capitalize">
                                          {resource.type}
                                        </span>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Assignment */}
                            {hasAssignment && (
                              <div className="mb-3">
                                <h4 className="text-sm font-medium text-gray-700 mb-2">
                                  Assignment
                                </h4>
                                <div
                                  className="flex items-center gap-2 p-2 bg-white rounded border cursor-pointer hover:bg-orange-50 transition-colors"
                                  onClick={() =>
                                    handleAssignmentClick(
                                      course._id || "",
                                      (lesson as { assignment?: string })
                                        .assignment || lesson._id
                                    )
                                  }
                                >
                                  <FileText className="w-4 h-4 text-orange-500" />
                                  <div className="flex-1">
                                    <span className="text-sm text-gray-700 block">
                                      {(
                                        lesson as {
                                          assignmentDetails?: {
                                            title?: string;
                                          };
                                        }
                                      ).assignmentDetails?.title ||
                                        "Course Assignment"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Quiz */}
                            {hasQuiz && (
                              <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-2">
                                  Quiz
                                </h4>
                                <div
                                  className="flex items-center gap-2 p-2 bg-white rounded border cursor-pointer hover:bg-green-50 transition-colors"
                                  onClick={() =>
                                    router.push(
                                      `/courses/${course._id}/quizzes/${
                                        (lesson as { quiz?: unknown })?.quiz
                                      }`
                                    )
                                  }
                                >
                                  <FileText className="w-4 h-4 text-green-500" />
                                  <span className="text-sm text-gray-700 flex-1">
                                    Lesson Quiz
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                    </div>
                  );
                })}
            </div>
          )}

          {/* Empty State */}
          {(!chapters || chapters.length === 0) &&
            (!lessons || lessons.filter((l) => !l.chapter).length === 0) && (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">
                  No course content available yet.
                </p>
              </div>
            )}
        </div>

        <div className="flex-1 hidden md:flex"></div>
      </div>
    </Container>
  );
}
