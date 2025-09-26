'use client';

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragOverEvent,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { ReactNode, useState } from 'react';

export interface DragItem {
  id: string;
  type: 'chapter' | 'lesson';
  data: any;
}

interface DragDropProviderProps {
  children: ReactNode;
  onDragStart?: (item: DragItem) => void;
  onDragEnd: (event: {
    active: DragItem;
    over: { id: string; type?: string } | null;
    sourceContainer: string;
    targetContainer: string;
    sourceIndex: number;
    targetIndex: number;
  }) => void;
}

export function DragDropProvider({ children, onDragStart, onDragEnd }: DragDropProviderProps) {
  const [activeItem, setActiveItem] = useState<DragItem | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeData = active.data.current as DragItem;
    setActiveItem(activeData);
    onDragStart?.(activeData);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveItem(null);

    if (!over) return;

    const activeData = active.data.current as DragItem;
    const overData = over.data.current;

    // Extract container and index information
    const activeContainer = active.data.current?.sortable?.containerId || 'default';
    const overContainer = overData?.sortable?.containerId || over.id;
    const activeIndex = active.data.current?.sortable?.index || 0;
    const overIndex = overData?.sortable?.index !== undefined ? overData.sortable.index : 0;

    onDragEnd({
      active: activeData,
      over: {
        id: over.id.toString(),
        type: overData?.type
      },
      sourceContainer: activeContainer,
      targetContainer: overContainer,
      sourceIndex: activeIndex,
      targetIndex: overIndex,
    });
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {children}
      <DragOverlay>
        {activeItem ? (
          <div className="bg-white border rounded-lg shadow-lg opacity-90 p-4">
            <span className="font-medium">
              {activeItem.type === 'chapter' ? '📚' : '📄'} {activeItem.data.title}
            </span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}