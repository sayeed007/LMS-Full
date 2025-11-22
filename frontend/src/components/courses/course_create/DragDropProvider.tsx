'use client';

import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  rectIntersection,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import { ReactNode, useState } from 'react';

export interface DragItem {
  id: string;
  type: 'chapter' | 'lesson';
  data: Record<string, unknown>;
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
  const [activeContainer, setActiveContainer] = useState<string>('');

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

    // Determine active container from the active item's context
    const container = findContainerFromElement(active.id.toString());
    setActiveContainer(container);

    onDragStart?.(activeData);
  };

  const handleDragOver = (event: DragOverEvent) => {
    // This helps track container changes during drag
  };

  const findContainerFromElement = (id: string): string => {
    // Use the data attributes we added
    const element = document.querySelector(`[data-sortable-id="${id}"]`);
    if (element) {
      const container = element.closest('[data-container-id]');
      return container?.getAttribute('data-container-id') || 'default';
    }
    return 'default';
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveItem(null);

    if (!over) {
      setActiveContainer('');
      return;
    }

    const activeData = active.data.current as DragItem;
    const overData = over.data.current;

    // Determine target container
    let overContainer = over.id.toString();

    // If dropping over an item (not a container), find its container
    if (overData && (overData.type === 'chapter' || overData.type === 'lesson')) {
      overContainer = findContainerFromElement(over.id.toString());
    }

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

    setActiveContainer('');
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      {children}
      <DragOverlay>
        {activeItem ? (
          <div className="bg-white border rounded-lg shadow-lg opacity-90 p-4">
            <span className="font-medium">
              {activeItem.type === 'chapter' ? '📚' : '📄'} {(activeItem.data as { title?: string }).title || 'Untitled'}
            </span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}