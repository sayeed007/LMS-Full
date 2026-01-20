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
  Play,
  Video,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { decodeHTMLEntities } from "@/lib/html-utils";
import { EmbeddedQuizRenderer } from "./EmbeddedQuizRenderer";

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
    { skip: !courseId || !lessonId }
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
          return (
            <div className="prose max-w-none">
              <div
                dangerouslySetInnerHTML={{
                  __html: decodeHTMLEntities(item.data.text || ""),
                }}
                className="text-gray-700 leading-relaxed"
              />
            </div>
          );

        case "video":
          return (
            <div className="bg-black rounded-lg overflow-hidden aspect-video">
              {item.data.url ? (
                <video
                  controls
                  className="w-full h-full"
                  onEnded={() => markItemComplete(item._id)}
                >
                  <source src={item.data.url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="flex items-center justify-center h-full text-white">
                  <div className="text-center">
                    <Play className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Video not available</p>
                  </div>
                </div>
              )}
            </div>
          );

        case "audio":
          return (
            <div className="bg-gray-50 rounded-lg p-6">
              {item.data.url ? (
                <audio
                  controls
                  className="w-full"
                  onEnded={() => markItemComplete(item._id)}
                >
                  <source src={item.data.url} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              ) : (
                <div className="text-center text-gray-500">
                  <Headphones className="w-8 h-8 mx-auto mb-2" />
                  <p>Audio not available</p>
                </div>
              )}
            </div>
          );

        case "document":
          return (
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Download className="w-8 h-8 text-blue-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {item.title || "Document"}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {item.description || "Download this document to continue"}
                    </p>
                  </div>
                </div>
                {item.data.url && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      window.open(item.data.url, "_blank");
                      markItemComplete(item._id);
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                )}
              </div>
            </div>
          );

        case "block":
          return (
            <div className="space-y-4">
              {item.data.items?.map((blockItem, index: number) => (
                <div
                  key={blockItem._id || index}
                  className="border-l-4 border-blue-200 pl-4"
                >
                  <h4 className="font-medium text-gray-900 mb-2">
                    {blockItem.data.title || `Block Item ${index + 1}`}
                  </h4>
                  <div className="text-gray-700 leading-relaxed">
                    {blockItem.type === "text" && blockItem.data.text && (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: decodeHTMLEntities(blockItem.data.text),
                        }}
                      />
                    )}
                    {(blockItem.type === "image" ||
                      blockItem.type === "video" ||
                      blockItem.type === "audio") &&
                      blockItem.data.url && (
                        <div className="mb-2">
                          {blockItem.type === "image" && (
                            <Image
                              src={blockItem.data.url}
                              alt={
                                blockItem.data.alt ||
                                blockItem.data.title ||
                                "Block content"
                              }
                              width={1200}
                              height={800}
                              className="max-w-full h-auto rounded-lg"
                            />
                          )}
                          {blockItem.type === "video" && (
                            <video controls className="w-full rounded-lg">
                              <source
                                src={blockItem.data.url}
                                type={blockItem.data.mimeType || "video/mp4"}
                              />
                            </video>
                          )}
                          {blockItem.type === "audio" && (
                            <audio controls className="w-full">
                              <source
                                src={blockItem.data.url}
                                type={blockItem.data.mimeType || "audio/mpeg"}
                              />
                            </audio>
                          )}
                        </div>
                      )}
                    {blockItem.data.description && (
                      <p className="text-sm text-gray-600 mt-2">
                        {blockItem.data.description}
                      </p>
                    )}
                  </div>
                </div>
              )) || <p className="text-gray-600">No block content available</p>}
            </div>
          );

        case "quiz":
          return (
            <EmbeddedQuizRenderer
              quizData={
                item.data.quiz || {
                  attempts: 0,
                  passingScore: 0,
                  questions: [],
                  shuffleQuestions: false,
                  showFeedback: false,
                  timeLimit: 0,
                }
              }
              onComplete={() => markItemComplete(item._id)}
            />
          );

        default:
          return (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-8 h-8 mx-auto mb-2" />
              <p>Content type not supported</p>
            </div>
          );
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
    { skip: !courseId || !lessonId }
  );

  return {
    contentItems: contentData?.data?.content || [],
    isLoading,
    error,
  };
}
