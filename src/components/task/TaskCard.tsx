import React from 'react';
import { cn } from '../../utils/cn';
import { Task } from '../../types';
import { useTaskStore } from '../../store/taskStore';
import { useUIStore } from '../../store/uiStore';
import { useUserStore, selectUser } from '../../store/userStore';
import { Checkbox } from '../ui/Checkbox';
import { Avatar } from '../ui/Avatar';
import { PriorityIcon } from './PriorityIcon';
import { getRelativeDateLabel, isOverdue } from '../../utils/date.utils';
import { getPriorityColor } from '../../utils/task.utils';

interface TaskCardProps {
  task: Task;
  className?: string;
  dragHandleProps?: any;
  isDragging?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, className, dragHandleProps, isDragging }) => {
  const { completeTask, uncompleteTask } = useTaskStore();
  const { openTaskDetail } = useUIStore();
  const user = useUserStore(selectUser(task.assigneeId || ''));
  const isDone = task.status === 'done';
  const isTaskOverdue = isOverdue(task.dueDate) && !isDone;

  return (
    <div
      className={cn(
        'bg-white dark:bg-[#2E2E2E] rounded-xl p-3 shadow-card cursor-pointer border-l-[3px] group',
        'hover:shadow-card-hover hover:-translate-y-1.5',
        'transition-all duration-200',
        'border border-[#E0E0E0] dark:border-white/5',
        isDone && 'opacity-60',
        isDragging && 'shadow-panel rotate-2 scale-105',
        className
      )}
      style={{ borderLeftColor: getPriorityColor(task.priority) }}
      onClick={() => openTaskDetail(task.id)}
    >
      {/* Header */}
      <div className="flex items-start gap-2 mb-2">
        <div onClick={(e) => e.stopPropagation()} className="flex-shrink-0 mt-0.5">
          <Checkbox
            checked={isDone}
            onChange={(checked) => checked ? completeTask(task.id) : uncompleteTask(task.id)}
            size="sm"
          />
        </div>
        <p className={cn('text-sm font-medium text-[#111111] dark:text-white leading-tight flex-1', isDone && 'line-through text-[#999999] dark:text-[#6B6B6B]')}>
          {task.title}
        </p>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <PriorityIcon priority={task.priority} size={12} showTooltip={false} />
        </div>
      </div>

      {/* Description preview */}
      {task.description && (
        <p className="text-xs text-[#555555] dark:text-[#A0A0A0] line-clamp-2 mb-2 ml-6">
          {task.description}
        </p>
      )}

      {/* Tags */}
      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2 ml-6">
          {task.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="px-1.5 py-0.5 bg-black/5 dark:bg-white/5 text-[#555555] dark:text-[#A0A0A0] rounded text-[10px]">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between ml-6">
        <div className="flex items-center gap-2">
          {/* Subtasks */}
          {task.subtaskIds.length > 0 && (
            <span className="text-xs text-[#999999] dark:text-[#6B6B6B] flex items-center gap-1">
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <path d="M2 3h8M2 6h6M2 9h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              {task.subtaskIds.length}
            </span>
          )}
          {/* Comments */}
          {task.commentIds.length > 0 && (
            <span className="text-xs text-[#999999] dark:text-[#6B6B6B] flex items-center gap-1">
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <path d="M2 2h8a1 1 0 011 1v5a1 1 0 01-1 1H5l-3 2V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
              </svg>
              {task.commentIds.length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Due date */}
          {task.dueDate && (
            <span className={cn('text-xs', isTaskOverdue ? 'text-red-500 dark:text-red-400' : 'text-[#999999] dark:text-[#6B6B6B]')}>
              {getRelativeDateLabel(task.dueDate)}
            </span>
          )}
          {/* Assignee */}
          {user && <Avatar user={user} size="xs" />}
        </div>
      </div>
    </div>
  );
};
