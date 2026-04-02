import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useShallow } from 'zustand/react/shallow';
import { cn } from '../../../utils/cn';
import { useTaskStore } from '../../../store/taskStore';
import { useProjectStore } from '../../../store/projectStore';
import { filterTasks, sortTasks } from '../../../utils/task.utils';
import { TaskRow } from '../../task/TaskRow';
import { TaskCreateInline } from '../../task/TaskCreateInline';
import { Button } from '../../ui/Button';

interface ListViewProps {
  projectId: string;
  filters?: any;
  sortBy?: any;
}

const SectionHeader: React.FC<{
  name: string;
  taskCount: number;
  isCollapsed: boolean;
  onToggle: () => void;
}> = ({ name, taskCount, isCollapsed, onToggle }) => (
  <div
    className="flex items-center gap-2 py-2 px-3 group cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors"
    onClick={onToggle}
  >
    <svg
      width="12" height="12" viewBox="0 0 12 12" fill="currentColor"
      className={cn('text-[#999999] dark:text-[#6B6B6B] transition-transform', isCollapsed ? '' : 'rotate-90')}
    >
      <path d="M3 2l5 4-5 4V2z" />
    </svg>
    <span className="text-sm font-semibold text-[#111111] dark:text-white">{name}</span>
    <span className="text-xs text-[#999999] dark:text-[#6B6B6B] bg-black/5 dark:bg-white/5 px-1.5 py-0.5 rounded">{taskCount}</span>
  </div>
);

export const ListView: React.FC<ListViewProps> = ({ projectId, filters, sortBy }) => {
  const sections = useProjectStore(useShallow((s) => {
    const project = s.projects[projectId];
    if (!project) return [];
    return project.sectionIds.map((id) => s.sections[id]).filter(Boolean);
  }));
  const allTasks = useTaskStore((state) => state.tasks);
  const { reorderTasks, moveTask } = useTaskStore();
  const { toggleSectionCollapse, createSection, addSectionToProject } = useProjectStore();
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;

    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceSectionId = source.droppableId;
    const destSectionId = destination.droppableId;

    const destSection = sections.find((s) => s.id === destSectionId);
    if (!destSection) return;

    const destTaskIds = [...destSection.taskIds];

    if (sourceSectionId === destSectionId) {
      const [removed] = destTaskIds.splice(source.index, 1);
      destTaskIds.splice(destination.index, 0, removed);
      reorderTasks(destSectionId, destTaskIds);
    } else {
      moveTask(draggableId, destSectionId, destination.index);
    }
  };

  const handleAddSection = () => {
    const name = prompt('Section name:');
    if (!name?.trim()) return;
    const section = createSection({
      name: name.trim(),
      projectId,
      taskIds: [],
      isCollapsed: false,
      position: sections.length,
    });
    addSectionToProject(projectId, section.id);
  };

  const toggleSection = (sectionId: string) => {
    setCollapsedSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const columnHeaders = (
    <div className="flex items-center px-3 py-2 text-xs font-medium text-[#999999] dark:text-[#6B6B6B] border-b border-[#E0E0E0] dark:border-white/5 sticky top-0 bg-[#F0EFEC] dark:bg-[#242424] z-10">
      <div className="w-6" />
      <div className="w-6" />
      <div className="flex-1">Task name</div>
      <div className="w-32 text-center hidden md:block">Assignee</div>
      <div className="w-24 text-center hidden sm:block">Due date</div>
      <div className="w-20 text-center hidden lg:block">Priority</div>
      <div className="w-24 text-center hidden lg:block">Status</div>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {columnHeaders}

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {sections.map((section) => {
            if (!section) return null;
            const sectionTasks = section.taskIds
              .map((id) => allTasks[id])
              .filter(Boolean)
              .filter((t) => !t.parentTaskId && !t.isArchived);

            const filtered = filters ? filterTasks(sectionTasks, filters) : sectionTasks;
            const sorted = sortBy ? sortTasks(filtered, sortBy) : filtered.sort((a, b) => a.position - b.position);
            const isCollapsed = collapsedSections[section.id];

            return (
              <div key={section.id} className="mb-2">
                <SectionHeader
                  name={section.name}
                  taskCount={sorted.length}
                  isCollapsed={isCollapsed}
                  onToggle={() => toggleSection(section.id)}
                />

                {!isCollapsed && (
                  <Droppable droppableId={section.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={cn(
                          'min-h-[8px] rounded-lg transition-colors',
                          snapshot.isDraggingOver && 'bg-[#44AADF]/5 border border-[#44AADF]/20'
                        )}
                      >
                        {sorted.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                              >
                                <TaskRow
                                  task={task}
                                  isDragging={snapshot.isDragging}
                                  dragHandleProps={provided.dragHandleProps}
                                  className="mb-0.5"
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}

                        <TaskCreateInline
                          projectId={projectId}
                          sectionId={section.id}
                        />
                      </div>
                    )}
                  </Droppable>
                )}
              </div>
            );
          })}

          {/* Add section */}
          <button
            onClick={handleAddSection}
            className="flex items-center gap-2 text-sm text-[#555555] dark:text-[#A0A0A0] hover:text-[#111111] dark:hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 mt-4"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Add section
          </button>
        </div>
      </DragDropContext>
    </div>
  );
};
