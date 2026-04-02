import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../utils/cn';
import { format, parseISO, isValid, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';

interface DatePickerProps {
  value: string | null;
  onChange: (date: string | null) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, placeholder = 'Set due date', className, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value ? parseISO(value) : new Date());
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const selected = value && isValid(parseISO(value)) ? parseISO(value) : null;

  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const handleDayClick = (day: Date) => {
    onChange(format(day, 'yyyy-MM-dd'));
    setIsOpen(false);
  };

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border border-[#E0E0E0] dark:border-white/10 bg-white dark:bg-[#333333] hover:border-[#44AADF]/50 transition-colors',
          selected ? 'text-[#111111] dark:text-white' : 'text-[#999999] dark:text-[#6B6B6B]',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="1" y="2" width="12" height="11" rx="1.5" />
          <path d="M1 5h12M4.5 1v2M9.5 1v2" />
        </svg>
        {selected ? format(selected, 'MMM d, yyyy') : placeholder}
      </button>

      {isOpen && (
        <div className="absolute top-full mt-1 left-0 z-50 bg-white dark:bg-[#2E2E2E] border border-[#E0E0E0] dark:border-white/10 rounded-xl shadow-xl p-3 w-64 animate-scale-in">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => setViewDate(subMonths(viewDate, 1))}
              className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-[#555555] dark:text-[#A0A0A0] hover:text-[#111111] dark:hover:text-white transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <span className="text-sm font-semibold text-[#111111] dark:text-white">{format(viewDate, 'MMMM yyyy')}</span>
            <button
              onClick={() => setViewDate(addMonths(viewDate, 1))}
              className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-[#555555] dark:text-[#A0A0A0] hover:text-[#111111] dark:hover:text-white transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {['Su','Mo','Tu','We','Th','Fr','Sa'].map((d) => (
              <div key={d} className="text-center text-[10px] text-[#999999] dark:text-[#6B6B6B] py-1 font-medium">{d}</div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-0.5">
            {days.map((day) => {
              const isCurrentMonth = isSameMonth(day, viewDate);
              const isSelected = selected && isSameDay(day, selected);
              const isTodayDate = isToday(day);
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => handleDayClick(day)}
                  className={cn(
                    'text-xs py-1.5 rounded-lg transition-colors font-medium',
                    !isCurrentMonth && 'text-[#D0D0D0] dark:text-[#555555]',
                    isCurrentMonth && !isSelected && !isTodayDate && 'text-[#333333] dark:text-[#D0D0D0] hover:bg-black/5 dark:hover:bg-white/10',
                    isTodayDate && !isSelected && 'text-[#44AADF]',
                    isSelected && 'bg-[#44AADF] text-white'
                  )}
                >
                  {format(day, 'd')}
                </button>
              );
            })}
          </div>

          {/* Clear */}
          {selected && (
            <button
              onClick={() => { onChange(null); setIsOpen(false); }}
              className="mt-2 w-full text-xs text-[#555555] dark:text-[#A0A0A0] hover:text-red-500 dark:hover:text-red-400 py-1 transition-colors"
            >
              Clear date
            </button>
          )}
        </div>
      )}
    </div>
  );
};
