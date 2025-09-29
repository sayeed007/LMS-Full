"use client";

import { useGetContentByLessonQuery } from "@/store/api/courseApi";
import { BookOpen, ChevronDown, ChevronRight, Clipboard, Clock, Download, ExternalLink, FileText, Grid3X3, Headphones, HelpCircle, Image, PlayCircle } from "lucide-react";

interface LessonContentDetailsProps {
  lessonId: string;
  courseId: string;
}

export function LessonContentDetails({ lessonId, courseId }: LessonContentDetailsProps) {
  const { data: contentData, isLoading } = useGetContentByLessonQuery(
    { courseId, lessonId },
    { skip: !courseId || !lessonId }
  );

  const content = contentData?.data?.content || [];

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <PlayCircle className="w-4 h-4 text-purple-500" />;
      case 'audio':
        return <Headphones className="w-4 h-4 text-green-500" />;
      case 'text':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'document':
        return <FileText className="w-4 h-4 text-red-500" />;
      case 'block':
        return <Grid3X3 className="w-4 h-4 text-indigo-500" />;
      case 'quiz':
        return <HelpCircle className="w-4 h-4 text-yellow-500" />;
      case 'assignment':
        return <Clipboard className="w-4 h-4 text-orange-500" />;
      case 'image':
        return <Image className="w-4 h-4 text-pink-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2].map((i) => (
          <div key={i} className="flex items-center gap-2 p-2 bg-gray-100 rounded animate-pulse">
            <div className="w-4 h-4 bg-gray-300 rounded"></div>
            <div className="w-32 h-4 bg-gray-300 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!content || content.length === 0) {
    return (
      <div className="text-sm text-gray-500 italic p-2">
        No content available
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {content.map((contentItem) => (
        <div key={contentItem._id} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded hover:bg-gray-50 transition-colors">
          {getContentIcon(contentItem.type)}
          <div className="flex-1">
            <div className="font-medium text-gray-900 text-sm">
              {contentItem.title || `${contentItem.type} content`}
            </div>
            {contentItem.description && (
              <div className="text-xs text-gray-500 mt-1">{contentItem.description}</div>
            )}
            {/* Show block items count if this is a block */}
            {contentItem.type === 'block' && contentItem.data?.items && (
              <div className="text-xs text-indigo-600 mt-1">
                {contentItem.data.items.length} interactive element{contentItem.data.items.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
          <div className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded capitalize">
            {contentItem.type}
          </div>
        </div>
      ))}
    </div>
  );
}