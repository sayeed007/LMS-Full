"use client";

import Image from "next/image";

interface BlockType {
  type: 'text' | 'image' | 'video' | 'audio' | 'document';
  label: string;
  icon: string;
}

interface BlockTypeSelectorProps {
  isOpen: boolean;
  onSelect: (type: 'text' | 'image' | 'video' | 'audio' | 'document') => void;
  onClose: () => void;
}

const blockTypes: BlockType[] = [
  { type: 'text', label: 'Text', icon: '/icons/TextAa.png' },
  { type: 'image', label: 'Image', icon: '/icons/Image.png' },
  { type: 'video', label: 'Video', icon: '/icons/Video.png' },
  { type: 'audio', label: 'Audio', icon: '/icons/Audio.png' },
  { type: 'document', label: 'Document', icon: '/icons/Document.png' },
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
              className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 transition-colors mb-0 ${index !== 0 ? 'border-t border-gray-100' : ''
                }`}
            >
              <Image
                width={20}
                height={20}
                src={blockType.icon}
                alt={blockType.type}
                className="w-5 h-5 text-blue-600"
              />
              <span className="text-sm">{blockType.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
