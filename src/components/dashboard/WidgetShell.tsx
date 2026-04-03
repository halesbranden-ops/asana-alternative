import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { cn } from '../../utils/cn';

interface WidgetShellProps {
  id: string;
  index: number;
  isEditMode: boolean;
  onRemove: () => void;
  children: React.ReactNode;
}

const DragIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
    <circle cx="4.5" cy="3" r="1.1" />
    <circle cx="9.5" cy="3" r="1.1" />
    <circle cx="4.5" cy="7" r="1.1" />
    <circle cx="9.5" cy="7" r="1.1" />
    <circle cx="4.5" cy="11" r="1.1" />
    <circle cx="9.5" cy="11" r="1.1" />
  </svg>
);

export const WidgetShell: React.FC<WidgetShellProps> = ({
  id, index, isEditMode, onRemove, children,
}) => (
  <Draggable draggableId={id} index={index} isDragDisabled={!isEditMode}>
    {(provided, snapshot) => (
      <div
        ref={provided.innerRef}
        {...provided.draggableProps}
        className={cn(
          'relative transition-all duration-150 animate-fade-slide-up',
          snapshot.isDragging && 'rotate-1 opacity-90 shadow-2xl z-50',
          index === 0 && 'stagger-1',
          index === 1 && 'stagger-2',
          index === 2 && 'stagger-3',
          index === 3 && 'stagger-4',
          index === 4 && 'stagger-5',
          index >= 5  && 'stagger-6',
        )}
      >
        {/* Edit-mode overlay ring */}
        {isEditMode && !snapshot.isDragging && (
          <div className="absolute inset-0 rounded-xl ring-2 ring-[#44AADF]/25 pointer-events-none z-10" />
        )}

        {/* Drag handle + remove button — top-right in edit mode */}
        {isEditMode && (
          <div className="absolute top-2 right-2 z-20 flex items-center gap-1">
            {/* Drag handle */}
            <div
              {...provided.dragHandleProps}
              className="p-1.5 rounded-lg bg-white dark:bg-[#383838] border border-[#E0E0E0] dark:border-white/15 cursor-grab active:cursor-grabbing text-[#555555] dark:text-[#A0A0A0] hover:text-[#111111] dark:hover:text-white shadow-sm transition-colors"
              title="Drag to reorder"
            >
              <DragIcon />
            </div>
            {/* Remove button */}
            <button
              onMouseDown={(e) => e.stopPropagation()}
              onClick={onRemove}
              className="p-1.5 rounded-lg bg-white dark:bg-[#383838] border border-[#E0E0E0] dark:border-white/15 text-[#999999] hover:text-red-500 dark:hover:text-red-400 shadow-sm transition-colors"
              title="Remove widget"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M8 2L2 8M2 2l6 6" />
              </svg>
            </button>
          </div>
        )}

        {children}
      </div>
    )}
  </Draggable>
);
