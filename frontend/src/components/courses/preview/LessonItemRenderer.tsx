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

  const contentItems = contentData?.data?.content || [];
  const hasContent = contentItems.length > 0;
  const hasResources = lesson.resources && lesson.resources.length > 0;

  // Check for assignments and quizzes in the content data
  const hasAssignment = contentItems.some(item => item.type === 'assignment');
  const hasQuiz = contentItems.some(item => item.type === 'quiz');

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
    <div className={`bg-white border rounded-lg ${
      isInChapter
        ? 'border-gray-200 ml-2'
        : 'border-gray-300 shadow-sm'
    }`}>
      {/* Lesson Header */}
      <div
        className={`flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
          isInChapter ? 'pl-4' : 'pl-3'
        }`}
        onClick={() => toggleLesson(lesson._id)}
      >
        <div className="flex items-center gap-3">
          {/* Different icon styling based on chapter context */}
          <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
            isInChapter
              ? 'bg-blue-100'
              : 'bg-green-100'
          }`}>
            <PlayCircle className={`w-4 h-4 ${
              isInChapter
                ? 'text-blue-600'
                : 'text-green-600'
            }`} />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-gray-900 font-medium">{lesson.title}</span>
              {/* Chapter indicator badge */}
              {isInChapter && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                  Chapter
                </span>
              )}
            </div>
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
            className={`text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-md ${
              isInChapter
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            <PlayCircle className="w-4 h-4 mr-1" />
            {isInChapter ? 'Start Chapter Lesson' : 'Start Lesson'}
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
              {contentItems.filter(item => item.type === 'assignment').map((assignmentItem, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-white rounded border mb-2">
                  <FileText className="w-4 h-4 text-orange-500" />
                  <div className="flex-1">
                    <span className="text-sm text-gray-700 block">
                      {assignmentItem.title || 'Course Assignment'}
                    </span>
                    {assignmentItem.data.assignment?.dueDate && (
                      <span className="text-xs text-gray-500">
                        Due: {new Date(assignmentItem.data.assignment.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-orange-600">
                    {assignmentItem.data.assignment?.maxPoints || 100} pts
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Quiz */}
          {hasQuiz && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Quiz</h4>
              {contentItems.filter(item => item.type === 'quiz').map((quizItem, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-white rounded border mb-2">
                  <FileText className="w-4 h-4 text-green-500" />
                  <div className="flex-1">
                    <span className="text-sm text-gray-700 block">
                      {quizItem.title || 'Lesson Quiz'}
                    </span>
                    {quizItem.data.quiz?.questions && (
                      <span className="text-xs text-gray-500">
                        {quizItem.data.quiz.questions.length} question{quizItem.data.quiz.questions.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-green-600">
                    {quizItem.data.quiz?.passingScore || 70}% to pass
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}