"use client";

import { Input } from "@/components/ui/input";

interface LessonContent {
  type: 'text' | 'blocks' | 'video' | 'document' | 'quiz' | 'assignment';
  blocks: any[];
  textContent?: string;
  title?: string;
  description?: string;
}

interface AssignmentContentEditorProps {
  content: LessonContent;
  onChange: (content: LessonContent) => void;
}

export default function AssignmentContentEditor({
  content,
  onChange
}: AssignmentContentEditorProps) {
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