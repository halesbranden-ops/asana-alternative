import { Task, TaskFilter, TaskSortBy, TaskGroupBy, Priority, TaskStatus } from '../types';
import { isOverdue, isDueToday } from './date.utils';
import { parseISO } from 'date-fns';

const PRIORITY_ORDER: Record<Priority, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
  none: 4,
};

const STATUS_ORDER: Record<TaskStatus, number> = {
  blocked: 0,
  in_progress: 1,
  in_review: 2,
  todo: 3,
  done: 4,
};

export function sortTasks(tasks: Task[], sortBy: TaskSortBy): Task[] {
  const sorted = [...tasks];
  switch (sortBy) {
    case 'priority':
      return sorted.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
    case 'status':
      return sorted.sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);
    case 'dueDate':
      return sorted.sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return parseISO(a.dueDate).getTime() - parseISO(b.dueDate).getTime();
      });
    case 'createdAt':
      return sorted.sort((a, b) => parseISO(b.createdAt).getTime() - parseISO(a.createdAt).getTime());
    case 'title':
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case 'assignee':
      return sorted.sort((a, b) => (a.assigneeId || '').localeCompare(b.assigneeId || ''));
    default:
      return sorted.sort((a, b) => a.position - b.position);
  }
}

export function filterTasks(tasks: Task[], filter: TaskFilter): Task[] {
  return tasks.filter((task) => {
    if (filter.assigneeId && task.assigneeId !== filter.assigneeId) return false;
    if (filter.priority && task.priority !== filter.priority) return false;
    if (filter.status && task.status !== filter.status) return false;
    if (filter.tags && filter.tags.length > 0) {
      const hasTag = filter.tags.some((tag) => task.tags.includes(tag));
      if (!hasTag) return false;
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      if (!task.title.toLowerCase().includes(q) && !task.description.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });
}

export function groupTasks(tasks: Task[], groupBy: TaskGroupBy): Record<string, Task[]> {
  if (groupBy === 'none') return { all: tasks };

  const groups: Record<string, Task[]> = {};

  tasks.forEach((task) => {
    let key: string;
    switch (groupBy) {
      case 'status':
        key = task.status;
        break;
      case 'priority':
        key = task.priority;
        break;
      case 'assignee':
        key = task.assigneeId || 'unassigned';
        break;
      case 'dueDate':
        if (!task.dueDate) key = 'no-date';
        else if (isOverdue(task.dueDate)) key = 'overdue';
        else if (isDueToday(task.dueDate)) key = 'today';
        else key = 'upcoming';
        break;
      default:
        key = 'all';
    }
    if (!groups[key]) groups[key] = [];
    groups[key].push(task);
  });

  return groups;
}

export function getStatusColor(status: TaskStatus): string {
  const colors: Record<TaskStatus, string> = {
    todo: '#6B7280',
    in_progress: '#3B82F6',
    in_review: '#8B5CF6',
    done: '#22C55E',
    blocked: '#EF4444',
  };
  return colors[status] || '#6B7280';
}

export function getStatusBg(status: TaskStatus): string {
  const colors: Record<TaskStatus, string> = {
    todo: 'bg-gray-100 dark:bg-gray-500/20 text-gray-600 dark:text-gray-400',
    in_progress: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400',
    in_review: 'bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-400',
    done: 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400',
    blocked: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400',
  };
  return colors[status] || 'bg-gray-100 dark:bg-gray-500/20 text-gray-600 dark:text-gray-400';
}

export function getStatusLabel(status: TaskStatus): string {
  const labels: Record<TaskStatus, string> = {
    todo: 'To Do',
    in_progress: 'In Progress',
    in_review: 'In Review',
    done: 'Done',
    blocked: 'Blocked',
  };
  return labels[status] || status;
}

export function getPriorityColor(priority: Priority): string {
  const colors: Record<Priority, string> = {
    urgent: '#EF4444',
    high: '#F97316',
    medium: '#EAB308',
    low: '#3B82F6',
    none: '#6B7280',
  };
  return colors[priority] || '#6B7280';
}

export function getPriorityBg(priority: Priority): string {
  const colors: Record<Priority, string> = {
    urgent: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400',
    high: 'bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400',
    medium: 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400',
    low: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400',
    none: 'bg-gray-100 dark:bg-gray-500/20 text-gray-600 dark:text-gray-400',
  };
  return colors[priority] || 'bg-gray-100 dark:bg-gray-500/20 text-gray-600 dark:text-gray-400';
}

export function getPriorityLabel(priority: Priority): string {
  const labels: Record<Priority, string> = {
    urgent: 'Urgent',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    none: 'None',
  };
  return labels[priority] || priority;
}

export function getProjectStatusColor(status: string): string {
  const colors: Record<string, string> = {
    on_track: '#22C55E',
    at_risk: '#EAB308',
    off_track: '#EF4444',
    on_hold: '#6B7280',
    complete: '#44AADF',
  };
  return colors[status] || '#6B7280';
}

export function getProjectStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    on_track: 'On Track',
    at_risk: 'At Risk',
    off_track: 'Off Track',
    on_hold: 'On Hold',
    complete: 'Complete',
  };
  return labels[status] || status;
}

export function getTaskCompletionPercent(tasks: Task[]): number {
  if (tasks.length === 0) return 0;
  const done = tasks.filter((t) => t.status === 'done').length;
  return Math.round((done / tasks.length) * 100);
}

export function getAvatarColor(userId: string): string {
  const colors = [
    '#44AADF', '#8E4F9E', '#EC228D', '#FF6B35', '#FFD600',
    '#00BEFF', '#4CAF50', '#FF4444', '#B1FF00', '#CF00FF',
  ];
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function getUserInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
