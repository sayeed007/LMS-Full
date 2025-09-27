"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, X, Paperclip, FileText, Video, File, HelpCircle, Clipboard, Grid3X3 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  useGetLessonByIdQuery,
  useUpdateLessonMutation
} from "@/store/api/courseApi";
import { showErrorToast, showSuccessToast } from "@/lib/toast-utils";

interface ContentBlock {
  id: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'document';
  content: any;
  order: number;
}

interface LessonContent {
  type: 'text' | 'blocks' | 'video' | 'document' | 'quiz' | 'assignment';
  blocks: ContentBlock[];
  textContent?: string;
  title?: string;
  description?: string;
}

export default function ContentEditor() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.course_id as string;
  const lessonId = params.lesson_id as string;

  const [contentType, setContentType] = useState<string>('text');

  useEffect(() => {
    // Get content type from URL parameters
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const typeParam = urlParams.get('type');
      if (typeParam) {
        setContentType(typeParam);
      }
    }
  }, []);

  const [lessonTitle, setLessonTitle] = useState("");
  const [content, setContent] = useState<LessonContent>({
    type: contentType as any,
    blocks: [],
    textContent: "",
  });

  // API hooks
  const { data: lessonData, isLoading } = useGetLessonByIdQuery(
    { courseId, lessonId },
    { skip: !courseId || !lessonId }
  );

  const [updateLesson, { isLoading: isUpdating }] = useUpdateLessonMutation();

  const lesson = lessonData?.data?.lesson;

  useEffect(() => {
    if (lesson) {
      setLessonTitle(lesson.title);
      try {
        const parsedContent = JSON.parse(lesson.content || '{}');
        setContent({
          type: contentType as any,
          blocks: parsedContent.blocks || [],
          textContent: parsedContent.textContent || "",
          title: parsedContent.title || "",
          description: parsedContent.description || "",
        });
      } catch (error) {
        console.error("Error parsing lesson content:", error);
      }
    }
  }, [lesson, contentType]);

  const handleSave = async () => {
    if (!courseId || !lessonId) return;

    try {
      await updateLesson({
        courseId,
        lessonId,
        data: {
          title: lessonTitle,
          content: JSON.stringify(content),
          type: contentType as any,
        },
      }).unwrap();

      showSuccessToast("Content saved successfully!");
    } catch (error) {
      console.error("Error saving content:", error);
      showErrorToast("Failed to save content");
    }
  };

  const handleBack = () => {
    router.back();
  };



  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Input
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                className="text-lg font-medium border-none shadow-none px-0 focus:ring-0"
                placeholder="Lesson title"
              />
              <Button variant="ghost" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={isUpdating}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            {isUpdating ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-4xl mx-auto p-6">
        {/* Debug info - remove this later */}
        <div className="mb-4 p-4 bg-gray-100 rounded">
          <p><strong>Debug Info:</strong></p>
          <p>Content Type: {contentType}</p>
          <p>Course ID: {courseId}</p>
          <p>Lesson ID: {lessonId}</p>
        </div>
        {contentType === 'text' && (
          <TextContentEditor
            content={content}
            onChange={setContent}
          />
        )}

        {contentType === 'block' && (
          <BlocksContentEditor
            content={content}
            onChange={setContent}
          />
        )}

        {contentType === 'assignment' && (
          <AssignmentContentEditor
            content={content}
            onChange={setContent}
          />
        )}

        {contentType === 'quiz' && (
          <QuizContentEditor
            content={content}
            onChange={setContent}
          />
        )}

        {['video', 'audio', 'document'].includes(contentType) && (
          <MediaContentEditor
            content={content}
            onChange={setContent}
            contentType={contentType}
          />
        )}

        {/* Fallback if no valid content type */}
        {!['text', 'block', 'assignment', 'quiz', 'video', 'audio', 'document'].includes(contentType) && (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-4">Invalid Content Type</h2>
            <p className="text-gray-600 mb-4">The content type "{contentType}" is not supported.</p>
            <Button onClick={handleBack} variant="outline">
              Go Back
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}


// Media Content Editor Component (for video, audio, document)
function MediaContentEditor({
  content,
  onChange,
  contentType
}: {
  content: LessonContent;
  onChange: (content: LessonContent) => void;
  contentType: string;
}) {
  const getMediaTypeLabel = () => {
    switch (contentType) {
      case 'video': return 'Video';
      case 'audio': return 'Audio';
      case 'document': return 'Document';
      default: return 'Media';
    }
  };

  const getAcceptedFileTypes = () => {
    switch (contentType) {
      case 'video': return 'video/*';
      case 'audio': return 'audio/*';
      case 'document': return '.pdf,.doc,.docx,.ppt,.pptx,.txt';
      default: return '*/*';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Input
          value={content.title || ""}
          onChange={(e) => onChange({
            ...content,
            title: e.target.value
          })}
          placeholder={`Add ${getMediaTypeLabel()} Title`}
          className="text-lg"
        />
      </div>

      <div>
        <textarea
          value={content.description || ""}
          onChange={(e) => onChange({
            ...content,
            description: e.target.value
          })}
          placeholder={`Add ${getMediaTypeLabel()} Description`}
          className="w-full border border-gray-300 rounded-lg p-4 min-h-[120px] resize-none"
        />
      </div>

      {/* File Upload Area */}
      <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
        <div className="text-blue-600 mb-4 text-4xl">
          {contentType === 'video' && '🎥'}
          {contentType === 'audio' && '🎵'}
          {contentType === 'document' && '📄'}
        </div>
        <h3 className="font-semibold mb-2">Upload {getMediaTypeLabel()}</h3>
        <p className="text-gray-600 text-sm mb-4">
          Choose a {getMediaTypeLabel().toLowerCase()} file from your device.
        </p>
        <input
          type="file"
          accept={getAcceptedFileTypes()}
          className="hidden"
          id="media-upload"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              // Handle file upload here
              console.log('File selected:', file);
            }
          }}
        />
        <label
          htmlFor="media-upload"
          className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors"
        >
          Select File
        </label>
        <p className="text-gray-500 text-xs mt-2">
          Maximum file upload size: 50 MB
        </p>
      </div>
    </div>
  );
}

// Text Content Editor Component
function TextContentEditor({
  content,
  onChange
}: {
  content: LessonContent;
  onChange: (content: LessonContent) => void;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Toolbar */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <select className="border border-gray-300 rounded px-3 py-1 text-sm">
            <option>Roboto</option>
          </select>
          <select className="border border-gray-300 rounded px-3 py-1 text-sm">
            <option>12pt</option>
          </select>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">A</Button>
            <Button variant="ghost" size="sm" className="font-bold">B</Button>
            <Button variant="ghost" size="sm" className="underline">U</Button>
          </div>
          <select className="border border-gray-300 rounded px-3 py-1 text-sm">
            <option>Style</option>
          </select>
        </div>
      </div>

      {/* Editor */}
      <div className="p-6">
        <textarea
          value={content.textContent || ""}
          onChange={(e) => onChange({
            ...content,
            textContent: e.target.value
          })}
          placeholder="Type here"
          className="w-full min-h-[400px] border-none outline-none resize-none text-gray-700"
        />
      </div>

      {/* Add Attachment */}
      <div className="border-t border-gray-200 p-4">
        <Button variant="outline" className="text-blue-600 border-blue-200">
          <Paperclip className="w-4 h-4 mr-2" />
          Add Attachment
        </Button>
      </div>
    </div>
  );
}

// Blocks Content Editor Component
function BlocksContentEditor({
  content,
  onChange
}: {
  content: LessonContent;
  onChange: (content: LessonContent) => void;
}) {
  const [showBlockTypeSelector, setShowBlockTypeSelector] = useState(false);

  const addContentBlock = (type: ContentBlock['type']) => {
    const newBlock: ContentBlock = {
      id: `block-${Date.now()}`,
      type,
      content: {},
      order: content.blocks.length + 1,
    };

    onChange({
      ...content,
      blocks: [...content.blocks, newBlock]
    });
    setShowBlockTypeSelector(false);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-8">Add content to your blocks</h2>
      </div>

      {/* Content Blocks */}
      {content.blocks.map((block, index) => (
        <ContentBlockRenderer
          key={block.id}
          block={block}
          onChange={(updatedBlock) => {
            const updatedBlocks = [...content.blocks];
            updatedBlocks[index] = updatedBlock;
            onChange({ ...content, blocks: updatedBlocks });
          }}
          onDelete={() => {
            const updatedBlocks = content.blocks.filter(b => b.id !== block.id);
            onChange({ ...content, blocks: updatedBlocks });
          }}
        />
      ))}

      {/* Add Content Button */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center relative">
        <Button
          onClick={() => setShowBlockTypeSelector(!showBlockTypeSelector)}
          className="bg-black text-white hover:bg-gray-800"
        >
          + Add Content
        </Button>

        {/* Block Type Selector */}
        {showBlockTypeSelector && (
          <div className="absolute right-4 top-4 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-10 min-w-[200px]">
            <div className="space-y-1">
              {[
                { type: 'text', label: 'Text', icon: FileText },
                { type: 'image', label: 'Image', icon: '🖼️' },
                { type: 'video', label: 'Video', icon: Video },
                { type: 'audio', label: 'Audio', icon: '🎵' },
                { type: 'document', label: 'Document', icon: File },
              ].map((blockType) => (
                <button
                  key={blockType.type}
                  onClick={() => addContentBlock(blockType.type as ContentBlock['type'])}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 rounded-md transition-colors"
                >
                  {typeof blockType.icon === 'string' ? (
                    <span>{blockType.icon}</span>
                  ) : (
                    <blockType.icon className="w-4 h-4 text-blue-600" />
                  )}
                  <span className="text-sm">{blockType.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close selector */}
      {showBlockTypeSelector && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setShowBlockTypeSelector(false)}
        />
      )}
    </div>
  );
}

// Assignment Content Editor Component
function AssignmentContentEditor({
  content,
  onChange
}: {
  content: LessonContent;
  onChange: (content: LessonContent) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <Input
          value={content.title || ""}
          onChange={(e) => onChange({
            ...content,
            title: e.target.value
          })}
          placeholder="Add Assignment Title"
          className="text-lg"
        />
      </div>

      <div>
        <textarea
          value={content.description || ""}
          onChange={(e) => onChange({
            ...content,
            description: e.target.value
          })}
          placeholder="Add Assignment Description"
          className="w-full border border-gray-300 rounded-lg p-4 min-h-[200px] resize-none"
        />
      </div>

      {/* File Upload Area */}
      <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
        <div className="text-blue-600 mb-4">
          📄
        </div>
        <h3 className="font-semibold mb-2">Upload File</h3>
        <p className="text-gray-600 text-sm mb-2">
          Choose docx, txt, pdf or ppt file from your device.
        </p>
        <p className="text-gray-500 text-xs">
          Maximum file upload size: 10 MB
        </p>
      </div>
    </div>
  );
}

// Quiz Content Editor Component (Simplified for now)
function QuizContentEditor({
  content,
  onChange
}: {
  content: LessonContent;
  onChange: (content: LessonContent) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Quiz Editor</h2>
        <p className="text-gray-600 mt-2">Quiz functionality will be integrated here</p>
      </div>
    </div>
  );
}

// Content Block Renderer
function ContentBlockRenderer({
  block,
  onChange,
  onDelete
}: {
  block: ContentBlock;
  onChange: (block: ContentBlock) => void;
  onDelete: () => void;
}) {
  // This would render different block types based on block.type
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <span className="font-medium capitalize">{block.type} Block</span>
        <Button variant="ghost" size="sm" onClick={onDelete}>
          <X className="w-4 h-4" />
        </Button>
      </div>
      {/* Block content would be rendered here based on type */}
      <div className="text-gray-500">
        {block.type} content editor will be implemented here
      </div>
    </div>
  );
}