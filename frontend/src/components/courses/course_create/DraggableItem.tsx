'use client';

import { useDraggable } from '@dnd-kit/core';
import { ReactNode } from 'react';
import { GripVertical } from 'lucide-react';

interface DraggableItemProps {
  id: string;
  type: 'chapter' | 'lesson';
  data: Record<string, unknown>;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}

export function DraggableItem({
  id,
  type,
  data,
  children,
  className = '',
  disabled = false
}: DraggableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id,
    data: { id, type, data },
    disabled,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${className} ${isDragging ? 'opacity-50 z-50' : ''} ${disabled ? 'cursor-not-allowed' : ''}`}
      {...attributes}
    >
      <div className="flex items-start gap-2">
        <div
          className={`flex-shrink-0 p-1 ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-grab active:cursor-grabbing'} hover:bg-gray-100 rounded`}
          {...listeners}
        >
          <GripVertical className="w-4 h-4 text-gray-400" />
        </div>
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}