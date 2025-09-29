"use client";

import { Button } from "@/components/ui/button";
import { useGetContentByLessonQuery } from "@/store/api/courseApi";
import { CourseResource, CourseLesson } from '@/types/backend-models';
import { ChevronDown, ChevronRight, Download, ExternalLink, FileText, PlayCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { LessonContentDetails } from "./LessonContentDetails";
import { LessonContentSummary } from "./LessonContentSummary";

interface LessonItemRendererProps {
  lesson: CourseLesson & { chapterId?: string };
  courseId: string;
  isInChapter?: boolean;
  expandedLessons: string[];
  toggleLesson: (lessonId: string) => void;
}

export function LessonItemRenderer({
  lesson,
  courseId,
  isInChapter = false,
  expandedLessons,
  toggleLesson
}: LessonItemRendererProps) {
  const router = useRouter();

  const { data: contentData } = useGetContentByLessonQuery(
    { courseId, lessonId: lesson._id },
    { skip: !courseId || !lesson._id }
  );

  const hasContent = (contentData?.data?.content || []).length > 0;
  const hasResources = lesson.resources && lesson.resources.length > 0;
  const hasAssignment = lesson.assignmentDetails || lesson.assignment;
  const hasQuiz = lesson.quiz;
  const isLessonExpanded = expandedLessons.includes(lesson._id);

  const handleResourceClick = (resource: CourseResource) => {
    if (resource.url) {
      window.open(resource.url, '_blank');
    }
  };

  const handleStartLesson = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the expand/collapse
    const chapterParam = lesson.chapterId ? `&chapter=${lesson.chapterId}` : '';
    router.push(`/courses/${courseId}/learn?lesson=${lesson._id}${chapterParam}`);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      {/* Lesson Header */}
      <div
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => toggleLesson(lesson._id)}
      >
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-green-100 rounded-md flex items-center justify-center">
            <PlayCircle className="w-4 h-4 text-green-600" />
          </div>
          <div className="flex flex-col">
            <span className="text-gray-900 font-medium">{lesson.title}</span>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>{lesson.estimatedDuration || 0} min</span>
                {(hasResources || hasAssignment || hasQuiz) && (
                  <>
                    <span>•</span>
                    <span className="text-blue-600">
                      {[hasResources && 'Resources', hasAssignment && 'Assignment', hasQuiz && 'Quiz']
                        .filter(Boolean)
                        .join(', ')}
                    </span>
                  </>
                )}
              </div>
              <LessonContentSummary
                lessonId={lesson._id}
                courseId={courseId}
              />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleStartLesson}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-md"
          >
            <PlayCircle className="w-4 h-4 mr-1" />
            Start Lesson
          </Button>
          {/* Show expand/collapse when there's content or additional items */}
          {(hasContent || hasResources || hasAssignment || hasQuiz) && (
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

      {/* Lesson Content */}
      {isLessonExpanded && (hasContent || hasResources || hasAssignment || hasQuiz) && (
        <div className="border-t border-gray-100 p-3 bg-gray-50">
          {/* Content Details */}
          {hasContent && (
            <div className="mb-3">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Lesson Content</h4>
              <LessonContentDetails
                lessonId={lesson._id}
                courseId={courseId}
              />
            </div>
          )}

          {/* Resources */}
          {hasResources && (
            <div className="mb-3">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Resources</h4>
              <div className="space-y-1">
                {lesson.resources.map((resource: CourseResource, resourceIndex: number) => (
                  <div
                    key={resourceIndex}
                    className="flex items-center gap-2 p-2 bg-white rounded border cursor-pointer hover:bg-blue-50 transition-colors"
                    onClick={() => handleResourceClick(resource)}
                  >
                    {resource.type === 'pdf' ? (
                      <FileText className="w-4 h-4 text-red-500" />
                    ) : resource.type === 'video' ? (
                      <PlayCircle className="w-4 h-4 text-purple-500" />
                    ) : resource.downloadable ? (
                      <Download className="w-4 h-4 text-green-500" />
                    ) : (
                      <ExternalLink className="w-4 h-4 text-blue-500" />
                    )}
                    <span className="text-sm text-gray-700 flex-1">{resource.title}</span>
                    <span className="text-xs text-gray-500 capitalize">{resource.type}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Assignment */}
          {hasAssignment && (
            <div className="mb-3">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Assignment</h4>
              <div className="flex items-center gap-2 p-2 bg-white rounded border">
                <FileText className="w-4 h-4 text-orange-500" />
                <div className="flex-1">
                  <span className="text-sm text-gray-700 block">
                    {lesson.assignmentDetails?.title || 'Course Assignment'}
                  </span>
                  {lesson.assignmentDetails?.dueDate && (
                    <span className="text-xs text-gray-500">
                      Due: {new Date(lesson.assignmentDetails.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <span className="text-xs text-orange-600">
                  {lesson.assignmentDetails?.maxScore || 100} pts
                </span>
              </div>
            </div>
          )}

          {/* Quiz */}
          {hasQuiz && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Quiz</h4>
              <div className="flex items-center gap-2 p-2 bg-white rounded border">
                <FileText className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-700 flex-1">Lesson Quiz</span>
                <span className="text-xs text-green-600">Quiz</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}