import { BookOpen, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { LessonItemRenderer } from "../preview/LessonItemRenderer";
import { CourseChapter, CourseLesson } from "@/types/backend-models";

interface CourseOutlineProps {
  chapters: CourseChapter[];
  lessons: CourseLesson[];
  courseId: string;
  mode: "preview" | "detail";
  title?: string;
}

export function CourseOutline({
  chapters,
  lessons,
  courseId,
  mode,
  title = "Course Outlines",
}: CourseOutlineProps) {
  const [expandedChapters, setExpandedChapters] = useState<string[]>([]);
  const [expandedLessons, setExpandedLessons] = useState<string[]>([]);

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

  return (
    <div className="flex-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>

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
                    <span className="text-blue-600 text-sm font-bold">Ch</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-900 font-medium text-lg">
                      {chapter?.title}
                    </span>
                    <span className="text-sm text-gray-500">
                      {chapterLessons.length} lesson
                      {chapterLessons.length !== 1 ? "s" : ""}
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
                  {chapterLessons.map((lesson: CourseLesson) => (
                    <LessonItemRenderer
                      key={lesson._id}
                      lesson={{ ...lesson, chapterId: chapter._id }}
                      courseId={courseId}
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
      {lessons.filter((lesson) => !lesson.chapter).length > 0 && (
        <div className="space-y-2">
          {mode === "detail" && (
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Additional Lessons
            </h3>
          )}
          {lessons
            .filter((lesson) => !lesson.chapter)
            .map((lesson) => (
              <LessonItemRenderer
                key={lesson._id}
                lesson={lesson}
                courseId={courseId}
                isInChapter={false}
                expandedLessons={expandedLessons}
                toggleLesson={toggleLesson}
              />
            ))}
        </div>
      )}

      {/* Empty State */}
      {(!chapters || chapters.length === 0) &&
        (!lessons || lessons.filter((l) => !l.chapter).length === 0) && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Content Yet
            </h3>
            <p className="text-gray-600">
              {mode === "preview"
                ? "Add chapters and lessons to see them in the preview."
                : "This course has no content available yet."}
            </p>
          </div>
        )}
    </div>
  );
}
