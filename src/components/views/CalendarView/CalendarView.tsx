import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths, startOfWeek, endOfWeek, isSameMonth } from 'date-fns';
import { useShallow } from 'zustand/react/shallow';
import { cn } from '../../../utils/cn';
import { useTaskStore } from '../../../store/taskStore';
import { useUIStore } from '../../../store/uiStore';
import { Task } from '../../../types';
import { getPriorityColor } from '../../../utils/task.utils';
import { parseISO, isValid } from 'date-fns';

interface CalendarViewProps {
  projectId: string;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ projectId }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const tasks = useTaskStore(useShallow((s) =>
    Object.values(s.tasks).filter((t) => t.projectId === projectId && !t.isArchived)
  ));
  const { openTaskDetail } = useUIStore();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const getTasksForDay = (day: Date): Task[] => {
    return tasks.filter((task) => {
      if (!task.dueDate) return false;
      try {
        const date = parseISO(task.dueDate);
        return isValid(date) && isSameDay(date, day);
      } catch {
        return false;
      }
    });
  };

  const selectedTasks = selectedDay ? getTasksForDay(selectedDay) : [];

  return (
    <div className="flex h-full">
      {/* Calendar */}
      <div className="flex-1 flex flex-col p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-[#555555] dark:text-[#A0A0A0] hover:text-[#111111] dark:hover:text-white transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <h2 className="text-lg font-bold text-[#111111] dark:text-white">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <button
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-[#555555] dark:text-[#A0A0A0] hover:text-[#111111] dark:hover:text-white transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1.5 text-sm bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 rounded-lg text-[#555555] dark:text-[#A0A0A0] transition-colors"
          >
            Today
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-xs font-medium text-[#999999] dark:text-[#6B6B6B] py-2">{day}</div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 flex-1 gap-1">
          {days.map((day) => {
            const dayTasks = getTasksForDay(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isTodayDate = isToday(day);
            const isSelected = selectedDay && isSameDay(day, selectedDay);

            return (
              <div
                key={day.toISOString()}
                onClick={() => setSelectedDay(isSelected ? null : day)}
                className={cn(
                  'border rounded-lg p-1.5 cursor-pointer transition-all min-h-[80px]',
                  isCurrentMonth
                    ? 'border-[#E0E0E0] dark:border-white/5'
                    : 'border-transparent opacity-40',
                  isSelected
                    ? 'border-[#44AADF]/50 bg-[#44AADF]/10'
                    : 'hover:bg-black/5 dark:hover:bg-white/5',
                  isTodayDate && 'border-[#44AADF]/30'
                )}
              >
                {/* Day number */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={cn(
                      'text-xs font-medium w-6 h-6 rounded-full flex items-center justify-center',
                      isTodayDate
                        ? 'bg-[#44AADF] text-white'
                        : 'text-[#555555] dark:text-[#A0A0A0]'
                    )}
                  >
                    {format(day, 'd')}
                  </span>
                </div>

                {/* Tasks */}
                <div className="space-y-0.5">
                  {dayTasks.slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      onClick={(e) => { e.stopPropagation(); openTaskDetail(task.id); }}
                      className="text-[10px] truncate px-1 py-0.5 rounded text-white cursor-pointer hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: `${getPriorityColor(task.priority)}33`, borderLeft: `2px solid ${getPriorityColor(task.priority)}` }}
                    >
                      {task.title}
                    </div>
                  ))}
                  {dayTasks.length > 3 && (
                    <div className="text-[10px] text-[#999999] dark:text-[#6B6B6B] px-1">+{dayTasks.length - 3} more</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Day detail panel */}
      {selectedDay && selectedTasks.length > 0 && (
        <div className="w-64 border-l border-[#E0E0E0] dark:border-white/10 p-4 flex flex-col flex-shrink-0">
          <h3 className="text-sm font-semibold text-[#111111] dark:text-white mb-3">
            {format(selectedDay, 'EEEE, MMM d')}
            <span className="ml-2 text-xs text-[#999999] dark:text-[#6B6B6B]">{selectedTasks.length} tasks</span>
          </h3>
          <div className="space-y-2 overflow-y-auto flex-1">
            {selectedTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => openTaskDetail(task.id)}
                className="p-2 rounded-lg bg-white dark:bg-[#2E2E2E] cursor-pointer hover:bg-[#F0EFEC] dark:hover:bg-white/10 transition-colors border-l-2"
                style={{ borderLeftColor: getPriorityColor(task.priority) }}
              >
                <p className="text-xs font-medium text-[#111111] dark:text-white truncate">{task.title}</p>
                <p className="text-[10px] text-[#999999] dark:text-[#6B6B6B] mt-0.5 capitalize">{task.status.replace('_', ' ')}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
