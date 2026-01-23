"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGetContentByLessonQuery } from "@/store/api/courseApi";
import { LessonContent } from "@/types/backend-models";
import {
  BookOpen,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  FileText,
  Headphones,
  Video,
} from "lucide-react";
import { useState } from "react";
import {
  AudioContentRenderer,
  BlockContentRenderer,
  DocumentContentRenderer,
  QuizContentRenderer,
  TextContentRenderer,
  UnsupportedContentRenderer,
  VideoContentRenderer,
} from "./content-renderers";

interface LessonContentRendererProps {
  lessonId: string;
  courseId: string;
  onComplete: () => void;
  onNext?: () => void;
  currentContentIndex?: number;
  onContentIndexChange?: (index: number) => void;
}

export function LessonContentRenderer({
  lessonId,
  courseId,
  onComplete,
  onNext,
  currentContentIndex: externalIndex,
  onContentIndexChange,
}: LessonContentRendererProps) {
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
  const [internalIndex, setInternalIndex] = useState(0);

  // Use external index if provided, otherwise use internal
  const currentContentIndex =
    externalIndex !== undefined ? externalIndex : internalIndex;
  const setCurrentContentIndex = onContentIndexChange || setInternalIndex;

  const {
    data: contentData,
    isLoading,
    error,
  } = useGetContentByLessonQuery(
    { courseId, lessonId },
    { skip: !courseId || !lessonId },
  );

  const contentItems = contentData?.data?.content || [];

  const markItemComplete = (itemId: string) => {
    setCompletedItems((prev) => new Set([...prev, itemId]));
  };

  const isAllContentCompleted =
    contentItems.length > 0 &&
    contentItems.every((item) => Array.from(completedItems).includes(item._id));

  const handleCompleteLesson = () => {
    onComplete();
  };

  const handlePreviousContent = () => {
    if (currentContentIndex > 0) {
      setCurrentContentIndex(currentContentIndex - 1);
    }
  };

  const handleNextContent = () => {
    if (currentContentIndex < contentItems.length - 1) {
      setCurrentContentIndex(currentContentIndex + 1);
    }
  };

  const currentContent = contentItems[currentContentIndex];
  const hasPrevious = currentContentIndex > 0;
  const hasNext = currentContentIndex < contentItems.length - 1;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lesson content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load lesson content</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!contentItems || contentItems.length === 0) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No content available
          </h3>
          <p className="text-gray-600">
            This lesson doesn&apos;t have any content yet.
          </p>
        </div>
      </div>
    );
  }

  const getContentIconLarge = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="w-5 h-5" />;
      case "audio":
        return <Headphones className="w-5 h-5" />;
      case "text":
        return <FileText className="w-5 h-5" />;
      case "document":
        return <Download className="w-5 h-5" />;
      case "block":
        return <BookOpen className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const renderContentItem = (item: LessonContent) => {
    const isCompleted = Array.from(completedItems).includes(item._id);

    const renderContent = () => {
      switch (item.type) {
        case "text":
          return <TextContentRenderer content={item} />;

        case "video":
          return (
            <VideoContentRenderer
              content={item}
              onComplete={markItemComplete}
            />
          );

        case "audio":
          return (
            <AudioContentRenderer
              content={item}
              onComplete={markItemComplete}
            />
          );

        case "document":
          return (
            <DocumentContentRenderer
              content={item}
              onComplete={markItemComplete}
            />
          );

        case "block":
          return <BlockContentRenderer content={item} />;

        case "quiz":
          return (
            <QuizContentRenderer content={item} onComplete={markItemComplete} />
          );

        default:
          return <UnsupportedContentRenderer content={item} />;
      }
    };

    return (
      <div
        key={item._id}
        className="border border-gray-200 rounded-lg overflow-hidden"
      >
        {/* Content Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${
                  isCompleted
                    ? "bg-green-100 text-green-600"
                    : "bg-blue-100 text-blue-600"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  getContentIconLarge(item.type)
                )}
              </div>
              <div>
                <h3 className="font-medium text-gray-900">
                  {item.title ||
                    `${
                      item.type.charAt(0).toUpperCase() + item.type.slice(1)
                    } Content`}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {item.type}
                  </Badge>
                  {item.data?.duration && (
                    <>
                      <span className="text-gray-300">•</span>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {Math.ceil(item.data.duration / 60)} min
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            {!isCompleted && item.type !== "video" && item.type !== "audio" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => markItemComplete(item._id)}
              >
                Mark Complete
              </Button>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {item.description && (
            <p className="text-gray-600 mb-4 leading-relaxed">
              {item.description}
            </p>
          )}
          {renderContent()}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Current Content Item */}
      {currentContent && renderContentItem(currentContent)}

      {/* Navigation Controls */}
      {contentItems.length > 1 && (
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={handlePreviousContent}
            disabled={!hasPrevious}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous Content
          </Button>

          <div className="text-sm text-gray-600">
            {currentContentIndex + 1} / {contentItems.length}
          </div>

          <Button
            onClick={handleNextContent}
            disabled={!hasNext}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Next Content
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Lesson Completion */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${
                isAllContentCompleted
                  ? "bg-green-100 text-green-600"
                  : "bg-blue-100 text-blue-600"
              }`}
            >
              {isAllContentCompleted ? (
                <CheckCircle className="w-6 h-6" />
              ) : (
                <BookOpen className="w-6 h-6" />
              )}
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                {isAllContentCompleted
                  ? "Lesson Completed!"
                  : "Complete this lesson"}
              </h3>
              <p className="text-sm text-gray-600">
                {isAllContentCompleted
                  ? "Great job! You can move on to the next lesson."
                  : `Complete all ${contentItems.length} content items to finish this lesson.`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAllContentCompleted && (
              <Button onClick={handleCompleteLesson} variant="outline">
                Mark as Complete
              </Button>
            )}
            {onNext && isAllContentCompleted && (
              <Button
                onClick={onNext}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Next Lesson
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Export content items data for use in sidebar
export function useContentItems(courseId: string, lessonId: string) {
  const {
    data: contentData,
    isLoading,
    error,
  } = useGetContentByLessonQuery(
    { courseId, lessonId },
    { skip: !courseId || !lessonId },
  );

  return {
    contentItems: contentData?.data?.content || [],
    isLoading,
    error,
  };
}
