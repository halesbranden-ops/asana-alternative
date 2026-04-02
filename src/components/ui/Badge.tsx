import React from 'react';
import { cn } from '../../utils/cn';
import { Priority, TaskStatus } from '../../types';
import { getPriorityBg, getPriorityLabel, getStatusBg, getStatusLabel } from '../../utils/task.utils';

interface BadgeProps {
  className?: string;
  children: React.ReactNode;
  color?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ className, children, size = 'md' }) => {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium',
        size === 'sm' ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-0.5 text-xs',
        className
      )}
    >
      {children}
    </span>
  );
};

interface PriorityBadgeProps {
  priority: Priority;
  showLabel?: boolean;
  className?: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, showLabel = true, className }) => {
  if (priority === 'none' && !showLabel) return null;

  const priorityDots: Record<Priority, string> = {
    urgent: '●',
    high: '↑',
    medium: '→',
    low: '↓',
    none: '–',
  };

  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', getPriorityBg(priority), className)}>
      <span>{priorityDots[priority]}</span>
      {showLabel && getPriorityLabel(priority)}
    </span>
  );
};

interface StatusBadgeProps {
  status: TaskStatus;
  showLabel?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, showLabel = true, className }) => {
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', getStatusBg(status), className)}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {showLabel && getStatusLabel(status)}
    </span>
  );
};

interface ProjectStatusBadgeProps {
  status: string;
  className?: string;
}

const projectStatusStyles: Record<string, string> = {
  on_track: 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400',
  at_risk: 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400',
  off_track: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400',
  on_hold: 'bg-gray-100 dark:bg-gray-500/20 text-gray-600 dark:text-gray-400',
  complete: 'bg-[#44AADF]/10 dark:bg-[#44AADF]/20 text-[#44AADF]',
};

const projectStatusLabels: Record<string, string> = {
  on_track: 'On Track',
  at_risk: 'At Risk',
  off_track: 'Off Track',
  on_hold: 'On Hold',
  complete: 'Complete',
};

export const ProjectStatusBadge: React.FC<ProjectStatusBadgeProps> = ({ status, className }) => {
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold', projectStatusStyles[status] || 'bg-gray-100 dark:bg-gray-500/20 text-gray-600 dark:text-gray-400', className)}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {projectStatusLabels[status] || status}
    </span>
  );
};
