"use client";

import { File, FileText, Video } from "lucide-react";

interface BlockType {
  type: 'text' | 'image' | 'video' | 'audio' | 'document';
  label: string;
  icon: typeof FileText | string;
}

interface BlockTypeSelectorProps {
  isOpen: boolean;
  onSelect: (type: 'text' | 'image' | 'video' | 'audio' | 'document') => void;
  onClose: () => void;
}

const blockTypes: BlockType[] = [
  { type: 'text', label: 'Text', icon: FileText },
  { type: 'image', label: 'Image', icon: '🖼️' },
  { type: 'video', label: 'Video', icon: Video },
  { type: 'audio', label: 'Audio', icon: '🎵' },
  { type: 'document', label: 'Document', icon: File },
];

export function BlockTypeSelector({
  isOpen,
  onSelect,
  onClose
}: BlockTypeSelectorProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay - Click outside to close */}
      <div
        className="fixed inset-0 z-5"
        onClick={onClose}
      />

      {/* Block Type Selector Popup */}
      <div className="absolute left-1/2 top-1/3 ml-18 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-10 min-w-[200px]">
        <div className="space-y-1">
          {blockTypes.map((blockType, index) => (
            <button
              key={blockType.type}
              onClick={() => onSelect(blockType.type)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 transition-colors mb-0 ${
                index !== 0 ? 'border-t border-gray-100' : ''
              }`}
            >
              {typeof blockType.icon === 'string' ? (
                <span className="text-lg">{blockType.icon}</span>
              ) : (
                <blockType.icon className="w-5 h-5 text-blue-600" />
              )}
              <span className="text-sm">{blockType.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
