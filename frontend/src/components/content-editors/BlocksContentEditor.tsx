"use client";

import { Button } from "@/components/ui/button";
import { File, FileText, Video, X } from "lucide-react";
import { useState } from "react";

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

interface BlocksContentEditorProps {
  content: LessonContent;
  onChange: (content: LessonContent) => void;
}

export default function BlocksContentEditor({
  content,
  onChange
}: BlocksContentEditorProps) {
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
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <span className="font-medium capitalize">{block.type} Block</span>
        <Button variant="ghost" size="sm" onClick={onDelete}>
          <X className="w-4 h-4" />
        </Button>
      </div>
      <div className="text-gray-500">
        {block.type} content editor will be implemented here
      </div>
    </div>
  );
}