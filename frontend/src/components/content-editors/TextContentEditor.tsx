"use client";

import { Button } from "@/components/ui/button";
import { Paperclip } from "lucide-react";
import RichTextEditor from "@/components/RichTextEditor";

interface LessonContent {
  type: 'text' | 'blocks' | 'video' | 'document' | 'quiz' | 'assignment';
  blocks: Array<{ id: string; type: string; content: unknown; order: number }>;
  textContent?: string;
  title?: string;
  description?: string;
}

interface TextContentEditorProps {
  content: LessonContent;
  onChange: (content: LessonContent) => void;
}

export default function TextContentEditor({
  content,
  onChange
}: TextContentEditorProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Editor */}
      <div className="p-6">
        <RichTextEditor
          value={content.textContent || ""}
          onChange={(value) => onChange({
            ...content,
            textContent: value
          })}
          placeholder="Type here"
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