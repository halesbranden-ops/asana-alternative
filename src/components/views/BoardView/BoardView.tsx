import React from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useShallow } from 'zustand/react/shallow';
import { cn } from '../../../utils/cn';
import { useTaskStore } from '../../../store/taskStore';
import { TaskCard } from '../../task/TaskCard';
import { TaskStatus } from '../../../types';
import { getStatusColor, getStatusLabel, filterTasks } from '../../../utils/task.utils';
import { useUIStore } from '../../../store/uiStore';

interface BoardViewProps {
  projectId: string;
  filters?: any;
}

const COLUMNS: { id: TaskStatus; label: string }[] = [
  { id: 'todo', label: 'To Do' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'in_review', label: 'In Review' },
  { id: 'done', label: 'Done' },
  { id: 'blocked', label: 'Blocked' },
];

export const BoardView: React.FC<BoardViewProps> = ({ projectId, filters }) => {
  const allProjectTasks = useTaskStore(useShallow((s) =>
    Object.values(s.tasks).filter((t) => t.projectId === projectId && !t.isArchived)
  ));
  const { updateTask } = useTaskStore();
  const { openTaskCreate } = useUIStore();

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    const newStatus = destination.droppableId as TaskStatus;
    updateTask(draggableId, { status: newStatus, columnId: newStatus });
  };

  const tasksByStatus = (status: TaskStatus) => {
    const tasks = allProjectTasks
      .filter((t) => t.status === status && !t.parentTaskId)
      .sort((a, b) => a.position - b.position);
    return filters ? filterTasks(tasks, filters) : tasks;
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 h-full overflow-x-auto p-4 pb-6">
        {COLUMNS.map((column) => {
          const tasks = tasksByStatus(column.id);
          const color = getStatusColor(column.id);

          return (
            <div
              key={column.id}
              className="flex flex-col flex-shrink-0 w-72 bg-[#EBEBEB] dark:bg-[#1C1C1C] rounded-xl overflow-hidden"
            >
              {/* Column header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-black/5 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-sm font-semibold text-[#111111] dark:text-white">{column.label}</span>
                  <span className="text-xs text-[#999999] dark:text-[#6B6B6B] bg-black/5 dark:bg-white/5 px-1.5 py-0.5 rounded-full">
                    {tasks.length}
                  </span>
                </div>
                <button
                  onClick={() => openTaskCreate(projectId)}
                  className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 text-[#999999] dark:text-[#6B6B6B] hover:text-[#111111] dark:hover:text-white transition-colors"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              {/* Cards */}
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      'flex-1 overflow-y-auto p-3 space-y-2 min-h-[100px] transition-colors',
                      snapshot.isDraggingOver && 'bg-black/5 dark:bg-white/5'
                    )}
                  >
                    {tasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <TaskCard
                              task={task}
                              isDragging={snapshot.isDragging}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}

                    {tasks.length === 0 && !snapshot.isDraggingOver && (
                      <div className="text-center py-6 text-xs text-[#999999] dark:text-[#6B6B6B]">
                        No tasks
                      </div>
                    )}
                  </div>
                )}
              </Droppable>

              {/* Add card */}
              <div className="p-3 border-t border-black/5 dark:border-white/5">
                <button
                  onClick={() => openTaskCreate(projectId)}
                  className="flex items-center gap-2 text-xs text-[#555555] dark:text-[#A0A0A0] hover:text-[#111111] dark:hover:text-white transition-colors w-full py-1.5 px-2 rounded hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  Add task
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
};
