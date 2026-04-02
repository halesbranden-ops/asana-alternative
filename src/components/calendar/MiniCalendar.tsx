import React, { useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  addDays,
  isSameMonth,
  isSameDay,
  isToday,
} from 'date-fns';
import { cn } from '../../utils/cn';

interface MiniCalendarProps {
  value: Date;
  onChange: (date: Date) => void;
  eventDates?: Date[];
}

export const MiniCalendar: React.FC<MiniCalendarProps> = ({ value, onChange, eventDates = [] }) => {
  const [viewMonth, setViewMonth] = useState<Date>(startOfMonth(value));

  const monthStart = startOfMonth(viewMonth);
  const monthEnd = endOfMonth(viewMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days: Date[] = [];
  let cur = calStart;
  while (cur <= calEnd) {
    days.push(cur);
    cur = addDays(cur, 1);
  }

  const hasEvent = (day: Date) =>
    eventDates.some((d) => isSameDay(d, day));

  return (
    <div className="select-none">
      {/* Month header */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setViewMonth((m) => subMonths(m, 1))}
          className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-[#555555] dark:text-[#A0A0A0] hover:text-[#111111] dark:hover:text-white transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          onClick={() => setViewMonth(startOfMonth(new Date()))}
          className="text-xs font-semibold text-[#111111] dark:text-white hover:text-[#44AADF] transition-colors"
        >
          {format(viewMonth, 'MMMM yyyy')}
        </button>
        <button
          onClick={() => setViewMonth((m) => addMonths(m, 1))}
          className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-[#555555] dark:text-[#A0A0A0] hover:text-[#111111] dark:hover:text-white transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 mb-1">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i} className="text-center text-[10px] font-semibold text-[#999999] dark:text-[#6B6B6B] py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {days.map((day) => {
          const isSelected = isSameDay(day, value);
          const isCurrent = isToday(day);
          const inMonth = isSameMonth(day, viewMonth);
          const hasEvt = hasEvent(day);

          return (
            <button
              key={day.toISOString()}
              onClick={() => {
                onChange(day);
                setViewMonth(startOfMonth(day));
              }}
              className={cn(
                'relative flex flex-col items-center justify-center w-7 h-7 mx-auto rounded-full text-[11px] transition-all',
                isSelected
                  ? 'bg-[#44AADF] text-white font-semibold'
                  : isCurrent
                  ? 'bg-black/10 dark:bg-white/15 text-[#111111] dark:text-white font-semibold'
                  : inMonth
                  ? 'text-[#333333] dark:text-[#CCCCCC] hover:bg-black/5 dark:hover:bg-white/10'
                  : 'text-[#BBBBBB] dark:text-[#555555] hover:bg-black/5 dark:hover:bg-white/5'
              )}
            >
              {format(day, 'd')}
              {hasEvt && !isSelected && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#44AADF]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
