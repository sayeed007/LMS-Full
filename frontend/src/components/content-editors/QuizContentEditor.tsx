"use client";

interface LessonContent {
  type: 'text' | 'blocks' | 'video' | 'document' | 'quiz' | 'assignment';
  blocks: Array<{ id: string; type: string; content: unknown; order: number }>;
  textContent?: string;
  title?: string;
  description?: string;
}

interface QuizContentEditorProps {
  content: LessonContent;
  onChange: (content: LessonContent) => void;
}

export default function QuizContentEditor({
  content: _content,
  onChange: _onChange
}: QuizContentEditorProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Quiz Editor</h2>
        <p className="text-gray-600 mt-2">Quiz functionality will be integrated here</p>
      </div>
    </div>
  );
}