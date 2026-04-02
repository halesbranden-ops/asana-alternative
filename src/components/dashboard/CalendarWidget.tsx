import React, { useState, useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isToday, isSameMonth, isSameDay,
  parseISO, isValid, addMonths, subMonths, startOfDay, isBefore,
} from 'date-fns';
import { useTaskStore } from '../../store/taskStore';
import { useCalendarStore } from '../../store/calendarStore';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../utils/cn';

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const COLOR_MAP: Record<string, string> = {
  blue:   '#44AADF',
  purple: '#8B5CF6',
  pink:   '#EC4899',
  green:  '#22C55E',
  yellow: '#EAB308',
  red:    '#EF4444',
  task:   '#22C55E',
};

interface DayItem {
  id: string;
  title: string;
  color: string;
  isTask: boolean;
  isOverdue: boolean;
  start: Date;
  end: Date;
}

export const CalendarWidget: React.FC = () => {
  const [current, setCurrent] = useState(new Date());
  const navigate = useNavigate();

  const tasks = useTaskStore(
    useShallow((s) =>
      Object.values(s.tasks).filter(
        (t) => !t.isArchived && t.status !== 'done' && !!t.dueDate
      )
    )
  );

  const calEvents = useCalendarStore(
    useShallow((s) => Object.values(s.events))
  );

  const monthStart = startOfMonth(current);
  const monthEnd   = endOfMonth(current);
  const calStart   = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calEnd     = endOfWeek(monthEnd,   { weekStartsOn: 0 });
  const days       = eachDayOfInterval({ start: calStart, end: calEnd });

  // Build flat list of items (tasks + events) with dates
  const allItems: DayItem[] = [];

  tasks.forEach((t) => {
    if (!t.dueDate) return;
    try {
      const d = parseISO(t.dueDate);
      if (!isValid(d)) return;
      allItems.push({
        id: t.id,
        title: t.title,
        color: '#22C55E',
        isTask: true,
        isOverdue: isBefore(startOfDay(d), startOfDay(new Date())),
        start: d,
        end: d,
      });
    } catch {}
  });

  calEvents.forEach((e) => {
    try {
      const s = parseISO(e.start);
      const en = parseISO(e.end);
      if (!isValid(s) || !isValid(en)) return;
      allItems.push({
        id: e.id,
        title: e.title,
        color: COLOR_MAP[e.color] ?? '#44AADF',
        isTask: false,
        isOverdue: false,
        start: s,
        end: en,
      });
    } catch {}
  });

  // Get items visible on a given day (including multi-day spans)
  const itemsForDay = useCallback(
    (day: Date): DayItem[] => {
      const ds = startOfDay(day);
      return allItems
        .filter((item) => {
          const s = startOfDay(item.start);
          const e = startOfDay(item.end);
          return ds >= s && ds <= e;
        })
        .sort((a, b) => a.start.getTime() - b.start.getTime());
    },
    [allItems]
  );

  return (
    <div className="bg-white dark:bg-[#2E2E2E] rounded-xl border border-[#E0E0E0] dark:border-white/10 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#E0E0E0] dark:border-white/10 flex-shrink-0">
        <h3 className="text-sm font-semibold text-[#111111] dark:text-white">Calendar</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrent(new Date())}
            className="px-2 py-0.5 rounded text-[11px] font-medium border border-[#E0E0E0] dark:border-white/10 text-[#555555] dark:text-[#A0A0A0] hover:border-[#44AADF] hover:text-[#44AADF] transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => setCurrent((d) => subMonths(d, 1))}
            className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-[#555555] dark:text-[#A0A0A0] transition-colors text-lg leading-none"
          >‹</button>
          <span className="text-sm font-semibold text-[#111111] dark:text-white w-28 text-center">
            {format(current, 'MMMM yyyy')}
          </span>
          <button
            onClick={() => setCurrent((d) => addMonths(d, 1))}
            className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-[#555555] dark:text-[#A0A0A0] transition-colors text-lg leading-none"
          >›</button>
          <button
            onClick={() => navigate('/calendar')}
            className="ml-2 px-2 py-0.5 rounded text-[11px] font-medium text-[#44AADF] hover:bg-[#44AADF]/10 transition-colors border border-[#44AADF]/30"
          >
            Open Full →
          </button>
        </div>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 border-b border-[#E0E0E0] dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02]">
        {DOW.map((d) => (
          <div
            key={d}
            className="py-2 text-center text-[11px] font-semibold text-[#999999] dark:text-[#6B6B6B] uppercase tracking-wide"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 flex-1" style={{ gridAutoRows: 'minmax(90px, 1fr)' }}>
        {days.map((day) => {
          const inMonth  = isSameMonth(day, current);
          const todayDay = isToday(day);
          const items    = itemsForDay(day);
          const visible  = items.slice(0, 3);
          // Count items that START today for overflow badge
          const startingToday = items.filter((i) => isSameDay(i.start, day)).length;
          const overflow = startingToday > 3 ? startingToday - 3 : 0;

          return (
            <div
              key={day.toISOString()}
              onClick={() => navigate('/calendar')}
              className={cn(
                'border-b border-r border-[#E0E0E0] dark:border-white/[0.07] p-1 cursor-pointer transition-colors',
                'hover:bg-black/[0.02] dark:hover:bg-white/[0.02]',
                !inMonth && 'opacity-35',
                todayDay && 'bg-[#44AADF]/5 dark:bg-[#44AADF]/10',
              )}
            >
              {/* Day number */}
              <div className="flex justify-end mb-1">
                <span
                  className={cn(
                    'w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium',
                    todayDay
                      ? 'bg-[#44AADF] text-white font-bold'
                      : 'text-[#555555] dark:text-[#A0A0A0]'
                  )}
                >
                  {format(day, 'd')}
                </span>
              </div>

              {/* Event/task chips */}
              <div className="space-y-0.5">
                {visible.map((item) => {
                  const hex = item.isOverdue ? '#EF4444' : item.color;
                  const isMultiDay = !isSameDay(item.start, item.end);
                  const isFirstDay = isSameDay(item.start, day);
                  const isLastDay  = isSameDay(item.end, day);
                  const isSunday   = day.getDay() === 0;
                  const showTitle  = isFirstDay || isSunday;

                  return (
                    <div
                      key={item.id}
                      className={cn(
                        'text-[10px] font-medium py-0.5 overflow-hidden whitespace-nowrap leading-tight',
                        showTitle ? 'pl-1.5' : 'pl-0.5',
                        (isLastDay || day.getDay() === 6) ? 'pr-1.5' : 'pr-0',
                      )}
                      style={{
                        backgroundColor: `${hex}22`,
                        borderLeft: (isFirstDay || isSunday) ? `2px solid ${hex}` : 'none',
                        color: hex,
                        marginRight: isMultiDay && !isLastDay && day.getDay() !== 6 ? '-4px' : undefined,
                        marginLeft:  isMultiDay && !isFirstDay && !isSunday ? '-4px' : undefined,
                        borderRadius: isMultiDay
                          ? `${(isFirstDay || isSunday) ? '3px' : '0'} ${(isLastDay || day.getDay() === 6) ? '3px' : '0'} ${(isLastDay || day.getDay() === 6) ? '3px' : '0'} ${(isFirstDay || isSunday) ? '3px' : '0'}`
                          : '3px',
                      }}
                      title={item.title}
                    >
                      {showTitle ? item.title : <span className="invisible">·</span>}
                    </div>
                  );
                })}

                {overflow > 0 && (
                  <div className="text-[10px] text-[#44AADF] font-medium px-1">
                    +{overflow} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-4 py-2 border-t border-[#E0E0E0] dark:border-white/10 flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: '#22C55E22', borderLeft: '2px solid #22C55E' }} />
          <span className="text-[10px] text-[#999999] dark:text-[#6B6B6B]">Tasks</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: '#44AADF22', borderLeft: '2px solid #44AADF' }} />
          <span className="text-[10px] text-[#999999] dark:text-[#6B6B6B]">Events</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: '#EF444422', borderLeft: '2px solid #EF4444' }} />
          <span className="text-[10px] text-[#999999] dark:text-[#6B6B6B]">Overdue</span>
        </div>
      </div>
    </div>
  );
};
