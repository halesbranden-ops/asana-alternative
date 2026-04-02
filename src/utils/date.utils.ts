import {
  format,
  isAfter,
  isBefore,
  isToday,
  isTomorrow,
  isThisWeek,
  differenceInDays,
  addDays,
  startOfDay,
  endOfDay,
  endOfWeek,
  parseISO,
  isValid,
  formatDistanceToNow,
} from 'date-fns';
import { Task } from '../types';

export function formatDate(dateStr: string | null, fmt = 'MMM d'): string {
  if (!dateStr) return '';
  try {
    const date = parseISO(dateStr);
    if (!isValid(date)) return '';
    return format(date, fmt);
  } catch {
    return '';
  }
}

export function formatDateFull(dateStr: string | null): string {
  return formatDate(dateStr, 'MMM d, yyyy');
}

export function formatDateTime(dateStr: string | null): string {
  return formatDate(dateStr, 'MMM d, yyyy h:mm a');
}

export function isOverdue(dateStr: string | null): boolean {
  if (!dateStr) return false;
  try {
    const date = parseISO(dateStr);
    return isBefore(endOfDay(date), new Date());
  } catch {
    return false;
  }
}

export function isDueToday(dateStr: string | null): boolean {
  if (!dateStr) return false;
  try {
    return isToday(parseISO(dateStr));
  } catch {
    return false;
  }
}

export function isDueTomorrow(dateStr: string | null): boolean {
  if (!dateStr) return false;
  try {
    return isTomorrow(parseISO(dateStr));
  } catch {
    return false;
  }
}

export function isDueThisWeek(dateStr: string | null): boolean {
  if (!dateStr) return false;
  try {
    return isThisWeek(parseISO(dateStr));
  } catch {
    return false;
  }
}

export function getDaysUntilDue(dateStr: string | null): number | null {
  if (!dateStr) return null;
  try {
    const date = parseISO(dateStr);
    return differenceInDays(startOfDay(date), startOfDay(new Date()));
  } catch {
    return null;
  }
}

export function getRelativeDateLabel(dateStr: string | null): string {
  if (!dateStr) return '';
  try {
    const date = parseISO(dateStr);
    const days = differenceInDays(startOfDay(date), startOfDay(new Date()));
    if (days < -1) return `${Math.abs(days)}d overdue`;
    if (days === -1) return 'Yesterday';
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days < 7) return `${days}d`;
    return format(date, 'MMM d');
  } catch {
    return '';
  }
}

export function timeAgo(dateStr: string): string {
  try {
    return formatDistanceToNow(parseISO(dateStr), { addSuffix: true });
  } catch {
    return '';
  }
}

export function groupTasksByDate(tasks: Task[]): {
  overdue: Task[];
  today: Task[];
  tomorrow: Task[];
  thisWeek: Task[];
  later: Task[];
  noDueDate: Task[];
} {
  const overdue: Task[] = [];
  const today: Task[] = [];
  const tomorrow: Task[] = [];
  const thisWeek: Task[] = [];
  const later: Task[] = [];
  const noDueDate: Task[] = [];

  // Sun–Sat calendar week: weekStartsOn: 0 (Sunday)
  const endOfThisWeek = endOfWeek(new Date(), { weekStartsOn: 0 });

  tasks.forEach((task) => {
    if (!task.dueDate) {
      noDueDate.push(task);
      return;
    }
    try {
      const date = parseISO(task.dueDate);
      if (isBefore(endOfDay(date), new Date()) && !isToday(date)) {
        overdue.push(task);
      } else if (isToday(date)) {
        today.push(task);
      } else if (isTomorrow(date)) {
        tomorrow.push(task);
      } else if (isBefore(date, endOfThisWeek) || date.getTime() === endOfThisWeek.getTime()) {
        // After today but still within this Sun–Sat week
        thisWeek.push(task);
      } else {
        later.push(task);
      }
    } catch {
      noDueDate.push(task);
    }
  });

  return { overdue, today, tomorrow, thisWeek, later, noDueDate };
}

export function getUpcomingTasks(tasks: Task[], days = 7): Task[] {
  const now = new Date();
  const future = addDays(now, days);
  return tasks.filter((t) => {
    if (!t.dueDate || t.status === 'done') return false;
    try {
      const date = parseISO(t.dueDate);
      return isAfter(date, now) && isBefore(date, future);
    } catch {
      return false;
    }
  });
}

export function getDaysBetween(start: string, end: string): number {
  try {
    return differenceInDays(parseISO(end), parseISO(start));
  } catch {
    return 0;
  }
}

export function addDaysToDate(dateStr: string, days: number): string {
  try {
    return format(addDays(parseISO(dateStr), days), 'yyyy-MM-dd');
  } catch {
    return dateStr;
  }
}

export function toISODate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}
