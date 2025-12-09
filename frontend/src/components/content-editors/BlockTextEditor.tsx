"use client";

import RichTextEditor from "@/components/RichTextEditor";

interface LessonContent {
  type: 'text' | 'blocks' | 'video' | 'document' | 'quiz' | 'assignment';
  blocks: Array<{ id: string; type: string; content: unknown; order: number }>;
  textContent?: string;
  title?: string;
  description?: string;
}

interface BlockTextEditorProps {
  content: LessonContent;
  onChange: (content: LessonContent) => void;
}

export default function BlockTextEditor({
  content,
  onChange
}: BlockTextEditorProps) {
  return (
    <div className="bg-white rounded-lg">
      <RichTextEditor
        value={content.textContent || ""}
        onChange={(value) => onChange({
          ...content,
          textContent: value
        })}
        placeholder="Type here"
      />
    </div>
  );
}