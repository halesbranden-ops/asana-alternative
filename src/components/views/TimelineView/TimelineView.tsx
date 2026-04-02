import React, { useRef } from 'react';
import { format, addDays, differenceInDays, startOfDay, parseISO, isValid, eachDayOfInterval, isToday, addWeeks, subWeeks, startOfWeek } from 'date-fns';
import { useShallow } from 'zustand/react/shallow';
import { cn } from '../../../utils/cn';
import { useTaskStore } from '../../../store/taskStore';
import { useUIStore } from '../../../store/uiStore';
import { getPriorityColor } from '../../../utils/task.utils';
import { Task } from '../../../types';

interface TimelineViewProps {
  projectId: string;
}

const DAY_WIDTH = 36;
const WEEKS_SHOWN = 12;
const ROW_HEIGHT = 40;

export const TimelineView: React.FC<TimelineViewProps> = ({ projectId }) => {
  const [startDate, setStartDate] = React.useState(() => startOfWeek(new Date(), { weekStartsOn: 0 }));
  const tasks = useTaskStore(useShallow((s) =>
    Object.values(s.tasks).filter((t) => t.projectId === projectId && !t.isArchived)
  ));
  const { openTaskDetail, updateTask } = useUIStore() as any;
  const { updateTask: storeUpdateTask } = useTaskStore();

  const endDate = addDays(startDate, WEEKS_SHOWN * 7 - 1);
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const projectTasks = tasks
    .filter((t) => !t.parentTaskId && !t.isArchived)
    .sort((a, b) => {
      if (!a.startDate && !b.startDate) return 0;
      if (!a.startDate) return 1;
      if (!b.startDate) return -1;
      return parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime();
    });

  const todayOffset = differenceInDays(startOfDay(new Date()), startOfDay(startDate));

  const getTaskBar = (task: Task) => {
    if (!task.dueDate) return null;
    const taskEnd = startOfDay(parseISO(task.dueDate));
    const taskStart = task.startDate ? startOfDay(parseISO(task.startDate)) : taskEnd;

    const startOffset = differenceInDays(taskStart, startOfDay(startDate));
    const duration = Math.max(1, differenceInDays(taskEnd, taskStart) + 1);

    if (startOffset + duration < 0 || startOffset > WEEKS_SHOWN * 7) return null;

    const left = Math.max(0, startOffset) * DAY_WIDTH;
    const width = Math.min(duration, WEEKS_SHOWN * 7 - Math.max(0, startOffset)) * DAY_WIDTH - 4;

    return { left, width };
  };

  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Navigation */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-[#E0E0E0] dark:border-white/10 flex-shrink-0">
        <button
          onClick={() => setStartDate(subWeeks(startDate, 4))}
          className="p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/10 text-[#555555] dark:text-[#A0A0A0] hover:text-[#111111] dark:hover:text-white transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
        </button>
        <span className="text-sm text-[#555555] dark:text-[#A0A0A0]">
          {format(startDate, 'MMM d')} – {format(endDate, 'MMM d, yyyy')}
        </span>
        <button
          onClick={() => setStartDate(addWeeks(startDate, 4))}
          className="p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/10 text-[#555555] dark:text-[#A0A0A0] hover:text-[#111111] dark:hover:text-white transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
        </button>
        <button
          onClick={() => setStartDate(startOfWeek(new Date(), { weekStartsOn: 0 }))}
          className="px-2.5 py-1 text-xs bg-black/5 dark:bg-white/10 rounded text-[#555555] dark:text-[#A0A0A0] hover:bg-black/10 dark:hover:bg-white/15 transition-colors"
        >
          Today
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left pane - task names */}
        <div className="w-64 flex-shrink-0 border-r border-[#E0E0E0] dark:border-white/10 overflow-y-auto">
          {/* Header spacer */}
          <div className="h-14 border-b border-[#E0E0E0] dark:border-white/5 bg-white dark:bg-[#1C1C1C]" />
          {/* Task rows */}
          {projectTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center px-3 border-b border-[#E0E0E0] dark:border-white/5 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors group"
              style={{ height: ROW_HEIGHT }}
              onClick={() => openTaskDetail(task.id)}
            >
              <div
                className="w-2 h-2 rounded-full flex-shrink-0 mr-2"
                style={{ backgroundColor: getPriorityColor(task.priority) }}
              />
              <span className="text-xs text-[#111111] dark:text-white truncate flex-1">{task.title}</span>
            </div>
          ))}
        </div>

        {/* Right pane - timeline */}
        <div className="flex-1 overflow-auto">
          <div style={{ width: days.length * DAY_WIDTH, position: 'relative' }}>
            {/* Week headers */}
            <div className="flex sticky top-0 bg-white dark:bg-[#1C1C1C] z-10 border-b border-[#E0E0E0] dark:border-white/10" style={{ height: 28 }}>
              {weeks.map((week, wi) => (
                <div
                  key={wi}
                  className="flex-shrink-0 border-r border-[#E0E0E0] dark:border-white/5 flex items-center px-2"
                  style={{ width: week.length * DAY_WIDTH }}
                >
                  <span className="text-[10px] text-[#555555] dark:text-[#A0A0A0] font-medium">
                    {format(week[0], 'MMM d')}
                  </span>
                </div>
              ))}
            </div>

            {/* Day headers */}
            <div className="flex border-b border-[#E0E0E0] dark:border-white/10 bg-white dark:bg-[#1C1C1C]" style={{ height: 28 }}>
              {days.map((day, i) => (
                <div
                  key={i}
                  className={cn(
                    'flex-shrink-0 flex items-center justify-center border-r border-[#E0E0E0] dark:border-white/5',
                    isToday(day) && 'bg-[#44AADF]/20'
                  )}
                  style={{ width: DAY_WIDTH }}
                >
                  <span className={cn('text-[10px]', isToday(day) ? 'text-[#44AADF] font-bold' : 'text-[#999999] dark:text-[#6B6B6B]')}>
                    {format(day, 'd')}
                  </span>
                </div>
              ))}
            </div>

            {/* Task rows */}
            <div className="relative">
              {/* Today line */}
              {todayOffset >= 0 && todayOffset < WEEKS_SHOWN * 7 && (
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-[#44AADF] z-20 pointer-events-none"
                  style={{ left: todayOffset * DAY_WIDTH + DAY_WIDTH / 2 }}
                />
              )}

              {/* Grid lines */}
              {days.map((day, i) => (
                <div
                  key={i}
                  className="absolute top-0 bottom-0 border-r border-[#E0E0E0] dark:border-white/5"
                  style={{ left: (i + 1) * DAY_WIDTH }}
                />
              ))}

              {/* Task bars */}
              {projectTasks.map((task, rowIndex) => {
                const bar = getTaskBar(task);
                const priorityColor = getPriorityColor(task.priority);
                return (
                  <div
                    key={task.id}
                    className="relative border-b border-[#E0E0E0] dark:border-white/5"
                    style={{ height: ROW_HEIGHT }}
                  >
                    {bar && (
                      <div
                        onClick={() => openTaskDetail(task.id)}
                        className="absolute top-1/2 -translate-y-1/2 rounded-lg cursor-pointer hover:brightness-95 dark:hover:brightness-110 transition-all flex items-center px-2 group"
                        style={{
                          left: bar.left + 2,
                          width: Math.max(bar.width, 40),
                          height: 26,
                          backgroundColor: `${priorityColor}22`,
                          borderLeft: `3px solid ${priorityColor}`,
                        }}
                      >
                        <span className="text-[10px] text-[#111111] dark:text-white truncate font-medium">{task.title}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
