'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ReactNode } from 'react';
import { GripVertical } from 'lucide-react';
import { cli } from 'webpack';

interface SortableItemProps {
  id: string;
  type: 'chapter' | 'lesson' | 'content';
  data: Record<string, unknown>;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}

export function SortableItem({
  id,
  type,
  data,
  children,
  className = '',
  disabled = false
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    data: { id, type, data },
    disabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${className} ${isDragging ? 'opacity-50 z-50' : ''} ${disabled ? 'cursor-not-allowed' : ''}`}
      data-sortable-id={id}
      {...attributes}
    >
      <div className="flex items-start gap-2">
        <div
          className={`flex-shrink-0 p-1 ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-grab active:cursor-grabbing'} hover:bg-gray-100 rounded`}
          {...listeners}
        >
          <GripVertical className="w-4 h-4 text-gray-400 mt-[22px]" />
        </div>
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}


