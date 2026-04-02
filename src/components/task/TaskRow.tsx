import React from 'react';
import { cn } from '../../utils/cn';
import { Task } from '../../types';
import { useTaskStore } from '../../store/taskStore';
import { useUIStore } from '../../store/uiStore';
import { useUserStore, selectUser } from '../../store/userStore';
import { Checkbox } from '../ui/Checkbox';
import { Avatar } from '../ui/Avatar';
import { PriorityBadge, StatusBadge } from '../ui/Badge';
import { PriorityIcon } from './PriorityIcon';
import { formatDate, isOverdue, getRelativeDateLabel } from '../../utils/date.utils';
import { getPriorityColor } from '../../utils/task.utils';

interface TaskRowProps {
  task: Task;
  className?: string;
  showProject?: boolean;
  dragHandleProps?: any;
  isDragging?: boolean;
}

export const TaskRow: React.FC<TaskRowProps> = ({ task, className, showProject, dragHandleProps, isDragging }) => {
  const { completeTask, uncompleteTask } = useTaskStore();
  const { openTaskDetail } = useUIStore();
  const user = useUserStore(selectUser(task.assigneeId || ''));
  const isDone = task.status === 'done';
  const isTaskOverdue = isOverdue(task.dueDate) && !isDone;

  const handleComplete = (checked: boolean) => {
    if (checked) {
      completeTask(task.id);
    } else {
      uncompleteTask(task.id);
    }
  };

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg group cursor-pointer relative',
        'hover:bg-black/5 dark:hover:bg-white/5 hover:-translate-y-px hover:shadow-card',
        'transition-all duration-150',
        isDone && 'opacity-60',
        isDragging && 'shadow-panel rotate-1 scale-105 opacity-90',
        className
      )}
      onClick={() => openTaskDetail(task.id)}
      style={{ borderLeft: `3px solid ${getPriorityColor(task.priority)}` }}
    >
      {/* Drag handle */}
      {dragHandleProps && (
        <div
          {...dragHandleProps}
          className="opacity-0 group-hover:opacity-100 text-[#D0D0D0] dark:text-[#6B6B6B] cursor-grab active:cursor-grabbing transition-opacity flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <circle cx="4" cy="3" r="1.2" />
            <circle cx="8" cy="3" r="1.2" />
            <circle cx="4" cy="6" r="1.2" />
            <circle cx="8" cy="6" r="1.2" />
            <circle cx="4" cy="9" r="1.2" />
            <circle cx="8" cy="9" r="1.2" />
          </svg>
        </div>
      )}

      {/* Checkbox */}
      <div onClick={(e) => e.stopPropagation()} className="flex-shrink-0">
        <Checkbox
          checked={isDone}
          onChange={handleComplete}
          size="sm"
        />
      </div>

      {/* Title */}
      <span className={cn('flex-1 text-sm text-[#111111] dark:text-white truncate min-w-0', isDone && 'line-through text-[#999999] dark:text-[#6B6B6B]')}>
        {task.title}
      </span>

      {/* Subtask count */}
      {task.subtaskIds.length > 0 && (
        <span className="text-xs text-[#999999] dark:text-[#6B6B6B] flex items-center gap-1 flex-shrink-0">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 3h8M2 6h6M2 9h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          {task.subtaskIds.length}
        </span>
      )}

      {/* Comment count */}
      {task.commentIds.length > 0 && (
        <span className="text-xs text-[#999999] dark:text-[#6B6B6B] flex items-center gap-1 flex-shrink-0">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 2h8a1 1 0 011 1v5a1 1 0 01-1 1H5l-3 2V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
          </svg>
          {task.commentIds.length}
        </span>
      )}

      {/* Tags */}
      {task.tags.slice(0, 2).map((tag) => (
        <span key={tag} className="hidden lg:inline-flex items-center px-1.5 py-0.5 bg-black/5 dark:bg-white/5 text-[#555555] dark:text-[#A0A0A0] rounded text-xs flex-shrink-0">
          #{tag}
        </span>
      ))}

      {/* Assignee */}
      {user && (
        <div className="flex-shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">
          <Avatar user={user} size="xs" />
        </div>
      )}

      {/* Due date */}
      {task.dueDate && (
        <span
          className={cn(
            'text-xs flex-shrink-0 hidden sm:block',
            isTaskOverdue ? 'text-red-500 dark:text-red-400' : 'text-[#999999] dark:text-[#6B6B6B]'
          )}
        >
          {getRelativeDateLabel(task.dueDate)}
        </span>
      )}

      {/* Priority */}
      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <PriorityIcon priority={task.priority} size={12} />
      </div>
    </div>
  );
};
