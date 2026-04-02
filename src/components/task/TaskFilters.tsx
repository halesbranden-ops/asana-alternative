import React from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useTaskStore } from '../../store/taskStore';
import { useUserStore } from '../../store/userStore';
import { Priority, TaskStatus } from '../../types';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';

export const TaskFilters: React.FC<{ className?: string }> = ({ className }) => {
  const { filters, setFilters, clearFilters } = useTaskStore();
  const allUsers = useUserStore(useShallow((s) => Object.values(s.users)));
  const hasFilters = Object.values(filters).some((v) => v !== undefined && v !== null && v !== '');

  const priorities: Priority[] = ['urgent', 'high', 'medium', 'low'];
  const statuses: TaskStatus[] = ['todo', 'in_progress', 'in_review', 'done', 'blocked'];

  const priorityColors: Record<string, string> = {
    urgent: 'text-red-600 dark:text-red-400 border-red-400/50',
    high: 'text-orange-600 dark:text-orange-400 border-orange-400/50',
    medium: 'text-yellow-600 dark:text-yellow-400 border-yellow-400/50',
    low: 'text-blue-600 dark:text-blue-400 border-blue-400/50',
  };

  return (
    <div className={cn('flex items-center gap-2 flex-wrap', className)}>
      {/* Search */}
      <div className="relative">
        <input
          type="text"
          value={filters.search || ''}
          onChange={(e) => setFilters({ search: e.target.value || undefined })}
          placeholder="Filter tasks..."
          className="bg-white dark:bg-[#333333] border border-[#E0E0E0] dark:border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#111111] dark:text-white placeholder-[#999999] dark:placeholder-[#6B6B6B] focus:outline-none focus:ring-1 focus:ring-[#44AADF]/50 w-48"
        />
        <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#999999] dark:text-[#6B6B6B] pointer-events-none" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="5.5" cy="5.5" r="3.5" />
          <path d="M9 9l2 2" strokeLinecap="round" />
        </svg>
      </div>

      {/* Assignee */}
      <select
        value={filters.assigneeId || ''}
        onChange={(e) => setFilters({ assigneeId: e.target.value || null })}
        className="bg-white dark:bg-[#333333] border border-[#E0E0E0] dark:border-white/10 rounded-lg px-2 py-1.5 text-xs text-[#111111] dark:text-white outline-none focus:ring-1 focus:ring-[#44AADF]/50 cursor-pointer"
      >
        <option value="">All assignees</option>
        {allUsers.map((u) => (
          <option key={u.id} value={u.id}>{u.name}</option>
        ))}
      </select>

      {/* Priority filters */}
      <div className="flex items-center gap-1">
        {priorities.map((p) => (
          <button
            key={p}
            onClick={() => setFilters({ priority: filters.priority === p ? null : p })}
            className={cn(
              'px-2 py-1 rounded text-xs border transition-all capitalize',
              filters.priority === p
                ? priorityColors[p] + ' bg-black/5 dark:bg-white/5'
                : 'text-[#555555] dark:text-[#A0A0A0] border-[#E0E0E0] dark:border-white/10 hover:border-[#D0D0D0] dark:hover:border-white/20'
            )}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Status filter */}
      <select
        value={filters.status || ''}
        onChange={(e) => setFilters({ status: (e.target.value as TaskStatus) || null })}
        className="bg-white dark:bg-[#333333] border border-[#E0E0E0] dark:border-white/10 rounded-lg px-2 py-1.5 text-xs text-[#111111] dark:text-white outline-none focus:ring-1 focus:ring-[#44AADF]/50 cursor-pointer"
      >
        <option value="">All statuses</option>
        {statuses.map((s) => (
          <option key={s} value={s}>{s.replace('_', ' ')}</option>
        ))}
      </select>

      {/* Clear */}
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          Clear filters
        </Button>
      )}
    </div>
  );
};
