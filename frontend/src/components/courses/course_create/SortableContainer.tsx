'use client';

import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { ReactNode } from 'react';

interface SortableContainerProps {
  id: string;
  items: string[];
  children: ReactNode;
  className?: string;
  type?: string;
}

export function SortableContainer({
  id,
  items,
  children,
  className = '',
  type = 'default'
}: SortableContainerProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      type,
      accepts: ['chapter', 'lesson'],
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`${className} ${isOver ? 'bg-blue-50 border-blue-200' : ''} transition-colors`}
      data-sortable-context
      data-container-id={id}
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
    </div>
  );
}