import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../utils/cn';
import { useTaskStore } from '../../store/taskStore';
import { useProjectStore } from '../../store/projectStore';
import { useUserStore, selectCurrentUser } from '../../store/userStore';
import { useUIStore } from '../../store/uiStore';

interface TaskCreateInlineProps {
  projectId: string;
  sectionId: string;
  onClose?: () => void;
  className?: string;
}

export const TaskCreateInline: React.FC<TaskCreateInlineProps> = ({
  projectId,
  sectionId,
  onClose,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { createTask } = useTaskStore();
  const { addTaskToSection } = useProjectStore();
  const currentUser = useUserStore(selectCurrentUser);
  const { addToast } = useUIStore();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = () => {
    const trimmed = title.trim();
    if (!trimmed) {
      setIsOpen(false);
      return;
    }

    const task = createTask({
      title: trimmed,
      description: '',
      projectId,
      sectionId,
      parentTaskId: null,
      subtaskIds: [],
      dependsOnIds: [],
      blockingIds: [],
      assigneeId: null,
      followerIds: [],
      status: 'todo',
      priority: 'none',
      tags: [],
      customFields: {},
      dueDate: null,
      startDate: null,
      completedAt: null,
      createdById: currentUser?.id || 'user-1',
      commentIds: [],
      attachments: [],
      isArchived: false,
      position: 999,
      columnId: 'todo',
    });

    addTaskToSection(sectionId, task.id);
    addToast({ type: 'success', message: `Task "${trimmed}" created` });
    setTitle('');
    setIsOpen(false);
    onClose?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
    if (e.key === 'Escape') {
      setIsOpen(false);
      setTitle('');
      onClose?.();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 text-sm text-[#555555] dark:text-[#A0A0A0] hover:text-[#111111] dark:hover:text-white transition-colors w-full rounded-lg hover:bg-black/5 dark:hover:bg-white/5',
          className
        )}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        Add task
      </button>
    );
  }

  return (
    <div className={cn('flex items-center gap-2 px-3 py-1.5 bg-black/5 dark:bg-white/5 rounded-lg border border-[#44AADF]/30', className)}>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-[#44AADF] flex-shrink-0">
        <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <input
        ref={inputRef}
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleSubmit}
        placeholder="Task title..."
        className="flex-1 bg-transparent text-sm text-[#111111] dark:text-white placeholder-[#999999] dark:placeholder-[#6B6B6B] outline-none"
      />
      <div className="flex items-center gap-1">
        <button
          onClick={handleSubmit}
          className="px-2 py-0.5 bg-[#44AADF] text-white text-xs rounded hover:bg-[#3399CE] transition-colors"
        >
          Add
        </button>
        <button
          onClick={() => { setIsOpen(false); setTitle(''); }}
          className="p-0.5 text-[#999999] dark:text-[#6B6B6B] hover:text-[#111111] dark:hover:text-white transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M9 3L3 9M3 3l6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
};
