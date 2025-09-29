"use client";

import { Button } from "@/components/ui/button";

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
          className="w-full min-h-[300px] border-none outline-none resize-none text-gray-700"
        />
      </div>

      {/* No attachment section for blocks */}
    </div>
  );
}