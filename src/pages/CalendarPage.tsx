import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from 'react';
import { useShallow } from 'zustand/react/shallow';
import {
  format,
  addDays,
  addWeeks,
  addMonths,
  subWeeks,
  subMonths,
  startOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  isToday,
  getHours,
  getMinutes,
  differenceInMinutes,
  addMinutes,
  startOfDay,
} from 'date-fns';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { cn } from '../utils/cn';
import { useCalendarStore, CalendarEvent, EventColor } from '../store/calendarStore';
import { useTaskStore } from '../store/taskStore';
import { useUserStore } from '../store/userStore';
import { Avatar } from '../components/ui/Avatar';
import { MiniCalendar } from '../components/calendar/MiniCalendar';
import { CalendarEventModal } from '../components/calendar/CalendarEventModal';

// ── Types ─────────────────────────────────────────────────────────────────────
type ViewType = 'month' | 'week' | 'day' | 'agenda';

interface FlatEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  color: EventColor | 'task';
  type: string;
  attendeeIds: string[];
  isTask: boolean;
  calEvent?: CalendarEvent;
}

// ── Constants ─────────────────────────────────────────────────────────────────
const COLOR_MAP: Record<EventColor | 'task', string> = {
  blue:   '#44AADF',
  purple: '#8B5CF6',
  pink:   '#EC4899',
  green:  '#22C55E',
  yellow: '#EAB308',
  red:    '#EF4444',
  task:   '#22C55E',
};

const HOUR_START = 6;   // 6 AM
const HOUR_END   = 22;  // 10 PM
const HOUR_PX    = 60;  // pixels per hour

const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_NAMES_LETTER = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const EVENT_TYPE_COLORS: { type: string; label: string; color: string }[] = [
  { type: 'meeting',  label: 'Meetings',  color: '#44AADF' },
  { type: 'task',     label: 'Tasks',     color: '#22C55E' },
  { type: 'deadline', label: 'Deadlines', color: '#EF4444' },
  { type: 'reminder', label: 'Reminders', color: '#EAB308' },
  { type: 'other',    label: 'Other',     color: '#8B5CF6' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function getColorHex(color: EventColor | 'task'): string {
  return COLOR_MAP[color] ?? '#44AADF';
}

function eventStyle(color: EventColor | 'task') {
  const hex = getColorHex(color);
  return {
    backgroundColor: `${hex}20`,
    borderLeft: `3px solid ${hex}`,
    color: hex,
  };
}

function getDateRangeLabel(date: Date, view: ViewType): string {
  if (view === 'month') return format(date, 'MMMM yyyy');
  if (view === 'week') {
    const start = startOfWeek(date, { weekStartsOn: 0 });
    const end = addDays(start, 6);
    if (start.getMonth() === end.getMonth()) {
      return `${format(start, 'MMM d')} – ${format(end, 'd, yyyy')}`;
    }
    return `${format(start, 'MMM d')} – ${format(end, 'MMM d, yyyy')}`;
  }
  if (view === 'day') return format(date, 'EEEE, MMMM d, yyyy');
  return format(date, 'MMMM yyyy');
}

function navigate(date: Date, view: ViewType, dir: 1 | -1): Date {
  if (view === 'month')  return dir === 1 ? addMonths(date, 1)  : subMonths(date, 1);
  if (view === 'week')   return dir === 1 ? addWeeks(date, 1)   : subWeeks(date, 1);
  if (view === 'day')    return dir === 1 ? addDays(date, 1)    : addDays(date, -1);
  return dir === 1 ? addMonths(date, 1) : subMonths(date, 1);
}

function clampToGrid(minutes: number): number {
  // snap to 15-min increments
  return Math.round(minutes / 15) * 15;
}

function minutesFromGridTop(y: number): number {
  // y pixels → minutes from HOUR_START
  return (y / HOUR_PX) * 60;
}

// ── Toolbar ───────────────────────────────────────────────────────────────────
const VIEWS: { key: ViewType; label: string }[] = [
  { key: 'month',  label: 'Month' },
  { key: 'week',   label: 'Week' },
  { key: 'day',    label: 'Day' },
  { key: 'agenda', label: 'Agenda' },
];

interface ToolbarProps {
  date: Date;
  view: ViewType;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onView: (v: ViewType) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ date, view, onPrev, onNext, onToday, onView }) => (
  <div className="flex items-center justify-between px-4 py-3 border-b border-[#D8D6D2] dark:border-white/10 bg-[#FAFAF8] dark:bg-[#2E2E2E] flex-shrink-0">
    <div className="flex items-center gap-2">
      <button
        onClick={onToday}
        className="px-3 py-1.5 rounded-lg text-sm font-medium border border-[#D8D6D2] dark:border-white/10 text-[#333333] dark:text-[#CCCCCC] hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
      >
        Today
      </button>
      <button onClick={onPrev} className="p-1.5 rounded-lg text-[#555555] dark:text-[#A0A0A0] hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button onClick={onNext} className="p-1.5 rounded-lg text-[#555555] dark:text-[#A0A0A0] hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <h2 className="text-sm font-semibold text-[#111111] dark:text-white ml-1">
        {getDateRangeLabel(date, view)}
      </h2>
    </div>
    <div className="flex items-center bg-[#F0EFEC] dark:bg-[#242424] rounded-lg p-0.5">
      {VIEWS.map((v) => (
        <button
          key={v.key}
          onClick={() => onView(v.key)}
          className={cn(
            'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
            view === v.key
              ? 'bg-white dark:bg-[#3A3A3A] text-[#111111] dark:text-white shadow-sm'
              : 'text-[#555555] dark:text-[#A0A0A0] hover:text-[#111111] dark:hover:text-white'
          )}
        >
          {v.label}
        </button>
      ))}
    </div>
  </div>
);

// ── Month View ────────────────────────────────────────────────────────────────
interface MonthViewProps {
  currentDate: Date;
  events: FlatEvent[];
  onDayClick: (day: Date) => void;
  onEventClick: (evt: FlatEvent) => void;
  onEventDrop: (eventId: string, targetDay: Date) => void;
}

const MonthView: React.FC<MonthViewProps> = ({
  currentDate,
  events,
  onDayClick,
  onEventClick,
  onEventDrop,
}) => {
  const gridStart = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: gridStart, end: addDays(gridStart, 41) });

  const eventsForDay = useCallback(
    (day: Date) => {
      const dayStart = startOfDay(day);
      return events
        .filter((e) => {
          const eStart = startOfDay(e.start);
          const eEnd = startOfDay(e.end);
          return dayStart >= eStart && dayStart <= eEnd;
        })
        .sort((a, b) => a.start.getTime() - b.start.getTime());
    },
    [events]
  );

  const onDragEnd = useCallback(
    (result: DropResult) => {
      if (!result.destination) return;
      const dayIndex = parseInt(result.destination.droppableId.replace('month-day-', ''), 10);
      const targetDay = days[dayIndex];
      onEventDrop(result.draggableId, targetDay);
    },
    [days, onEventDrop]
  );

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex-1 overflow-auto">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-[#E8E7E4] dark:border-white/10 bg-[#FAFAF8] dark:bg-[#2E2E2E] sticky top-0 z-10">
          {DAY_NAMES_SHORT.map((d) => (
            <div key={d} className="py-2 text-center text-[11px] font-semibold text-[#999999] dark:text-[#6B6B6B] uppercase tracking-wider">
              {d}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7" style={{ gridAutoRows: 'minmax(100px, 1fr)' }}>
          {days.map((day, idx) => {
            const dayEvents = eventsForDay(day);
            const inMonth = isSameMonth(day, currentDate);
            const todayDay = isToday(day);
            const visible = dayEvents.slice(0, 3);
            // Only count events that START on this day for "+N more" to avoid inflated counts
            const startingHere = dayEvents.filter(e => isSameDay(e.start, day)).length;
            const overflow = startingHere > 3 ? startingHere - 3 : 0;

            return (
              <Droppable droppableId={`month-day-${idx}`} key={day.toISOString()}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    onClick={() => onDayClick(day)}
                    className={cn(
                      'border-b border-r border-[#E8E7E4] dark:border-white/10 p-1 cursor-pointer min-h-[100px]',
                      !inMonth && 'opacity-40',
                      todayDay && 'bg-[#44AADF]/5 dark:bg-[#44AADF]/10',
                      snapshot.isDraggingOver && 'bg-[#44AADF]/10 dark:bg-[#44AADF]/15',
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

                    {/* Events */}
                    <div className="space-y-0.5">
                      {visible.map((evt, evtIdx) => {
                        const hex = getColorHex(evt.color);
                        const isMultiDay = !isSameDay(evt.start, evt.end);
                        const isFirstDay = isSameDay(evt.start, day);
                        const isLastDay = isSameDay(evt.end, day);
                        // Sunday = start of grid row → force left cap even on continuations
                        const isSunday = day.getDay() === 0;
                        const showTitle = isFirstDay || isSunday;

                        return (
                          <Draggable
                            key={evt.id}
                            draggableId={evt.id}
                            index={evtIdx}
                            isDragDisabled={evt.isTask}
                          >
                            {(drag, dragSnap) => (
                              <div
                                ref={drag.innerRef}
                                {...drag.draggableProps}
                                {...drag.dragHandleProps}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEventClick(evt);
                                }}
                                className={cn(
                                  'text-[10px] font-medium py-0.5 cursor-pointer transition-opacity overflow-hidden whitespace-nowrap',
                                  dragSnap.isDragging && 'opacity-60 shadow-lg',
                                  // horizontal padding: only on first/last for visual span
                                  (isFirstDay || isSunday) ? 'pl-1.5' : 'pl-0.5',
                                  (isLastDay || day.getDay() === 6) ? 'pr-1.5' : 'pr-0',
                                )}
                                style={{
                                  backgroundColor: `${hex}25`,
                                  borderLeft: (isFirstDay || isSunday) ? `2px solid ${hex}` : 'none',
                                  // extend to edge of cell on right if not last day / not Saturday
                                  marginRight: isMultiDay && !isLastDay && day.getDay() !== 6 ? '-4px' : undefined,
                                  marginLeft: isMultiDay && !isFirstDay && !isSunday ? '-4px' : undefined,
                                  borderRadius: isMultiDay
                                    ? `${(isFirstDay || isSunday) ? '3px' : '0'} ${(isLastDay || day.getDay() === 6) ? '3px' : '0'} ${(isLastDay || day.getDay() === 6) ? '3px' : '0'} ${(isFirstDay || isSunday) ? '3px' : '0'}`
                                    : '3px',
                                  color: hex,
                                }}
                                title={evt.title}
                              >
                                {showTitle ? (
                                  <>
                                    {!evt.allDay && isFirstDay && (
                                      <span className="opacity-70 mr-1">{format(evt.start, 'h:mma')}</span>
                                    )}
                                    {evt.title}
                                  </>
                                ) : (
                                  /* invisible spacer to maintain height on continuation days */
                                  <span className="invisible">·</span>
                                )}
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                      {overflow > 0 && (
                        <button
                          onClick={(e) => { e.stopPropagation(); }}
                          className="text-[10px] text-[#44AADF] font-medium px-1.5 hover:underline"
                        >
                          +{overflow} more
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </Droppable>
            );
          })}
        </div>
      </div>
    </DragDropContext>
  );
};

// ── Week / Day shared time grid ───────────────────────────────────────────────
interface TimeGridProps {
  days: Date[];
  events: FlatEvent[];
  onSlotClick: (day: Date, hour: number, minute: number) => void;
  onEventClick: (evt: FlatEvent) => void;
  onEventMove: (eventId: string, newStart: Date) => void;
  onEventResize: (eventId: string, newEnd: Date) => void;
}

interface DragState {
  type: 'move' | 'resize';
  eventId: string;
  startY: number;
  originalStart: Date;
  originalEnd: Date;
  dayIndex: number;
  currentStart: Date;
  currentEnd: Date;
}

const TimeGrid: React.FC<TimeGridProps> = ({
  days,
  events,
  onSlotClick,
  onEventClick,
  onEventMove,
  onEventResize,
}) => {
  const hours = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i);
  const totalHeight = (HOUR_END - HOUR_START) * HOUR_PX;
  const gridRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);

  const eventsForDay = useCallback(
    (day: Date) =>
      events.filter((e) => !e.allDay && isSameDay(e.start, day)),
    [events]
  );

  const allDayForDay = useCallback(
    (day: Date) => events.filter((e) => e.allDay && isSameDay(e.start, day)),
    [events]
  );

  const eventTop = (evt: FlatEvent) => {
    const h = getHours(evt.start);
    const m = getMinutes(evt.start);
    return Math.max(0, (h - HOUR_START) * HOUR_PX + (m / 60) * HOUR_PX);
  };

  const eventHeight = (evt: FlatEvent) => {
    const mins = differenceInMinutes(evt.end, evt.start);
    return Math.max(24, (mins / 60) * HOUR_PX);
  };

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, evt: FlatEvent, type: 'move' | 'resize', dayIndex: number) => {
      e.preventDefault();
      e.stopPropagation();
      const state: DragState = {
        type,
        eventId: evt.id,
        startY: e.clientY,
        originalStart: new Date(evt.start),
        originalEnd: new Date(evt.end),
        dayIndex,
        currentStart: new Date(evt.start),
        currentEnd: new Date(evt.end),
      };
      dragRef.current = state;
      setDragState({ ...state });
    },
    []
  );

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const ds = dragRef.current;
      const deltaY = e.clientY - ds.startY;
      const deltaMins = clampToGrid(minutesFromGridTop(deltaY));

      if (ds.type === 'move') {
        const newStart = addMinutes(ds.originalStart, deltaMins);
        const duration = differenceInMinutes(ds.originalEnd, ds.originalStart);
        const newEnd = addMinutes(newStart, duration);
        const updated: DragState = { ...ds, currentStart: newStart, currentEnd: newEnd };
        dragRef.current = updated;
        setDragState({ ...updated });
      } else {
        const newEnd = addMinutes(ds.originalEnd, deltaMins);
        if (differenceInMinutes(newEnd, ds.originalStart) >= 15) {
          const updated: DragState = { ...ds, currentEnd: newEnd };
          dragRef.current = updated;
          setDragState({ ...updated });
        }
      }
    };

    const onMouseUp = () => {
      if (!dragRef.current) return;
      const ds = dragRef.current;
      if (ds.type === 'move') {
        // Change the date to the column's day, keep the computed time
        const targetDay = days[ds.dayIndex];
        const newStart = new Date(targetDay);
        newStart.setHours(ds.currentStart.getHours(), ds.currentStart.getMinutes(), 0, 0);
        onEventMove(ds.eventId, newStart);
      } else {
        onEventResize(ds.eventId, ds.currentEnd);
      }
      dragRef.current = null;
      setDragState(null);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [days, onEventMove, onEventResize]);

  // Current time indicator
  const nowTop = useMemo(() => {
    const now = new Date();
    const h = getHours(now);
    const m = getMinutes(now);
    if (h < HOUR_START || h >= HOUR_END) return null;
    return (h - HOUR_START) * HOUR_PX + (m / 60) * HOUR_PX;
  }, []);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* All-day row */}
      <div className="flex border-b border-[#E8E7E4] dark:border-white/10 flex-shrink-0 bg-[#FAFAF8] dark:bg-[#2E2E2E]">
        <div className="w-16 flex-shrink-0 border-r border-[#E8E7E4] dark:border-white/10" />
        {days.map((day) => {
          const allDay = allDayForDay(day);
          const todayDay = isToday(day);
          return (
            <div
              key={day.toISOString()}
              className="flex-1 border-r border-[#E8E7E4] dark:border-white/10 px-1 py-1 min-h-[28px]"
            >
              <div className={cn('text-xs font-semibold text-center mb-1', todayDay ? 'text-[#44AADF]' : 'text-[#555555] dark:text-[#A0A0A0]')}>
                {days.length > 1
                  ? `${DAY_NAMES_SHORT[day.getDay()]} ${format(day, 'd')}`
                  : format(day, 'EEEE, MMMM d')}
              </div>
              {allDay.map((evt) => {
                const hex = getColorHex(evt.color);
                return (
                  <div
                    key={evt.id}
                    onClick={() => onEventClick(evt)}
                    className="text-[10px] font-medium px-1 py-0.5 rounded truncate cursor-pointer mb-0.5"
                    style={{ backgroundColor: `${hex}20`, borderLeft: `2px solid ${hex}`, color: hex }}
                  >
                    {evt.title}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Scrollable time grid */}
      <div className="flex-1 overflow-y-auto" ref={gridRef}>
        <div className="flex" style={{ height: totalHeight }}>
          {/* Time gutter */}
          <div className="w-16 flex-shrink-0 relative border-r border-[#E8E7E4] dark:border-white/10">
            {hours.map((h) => (
              <div
                key={h}
                className="absolute w-full pr-2 text-right"
                style={{ top: (h - HOUR_START) * HOUR_PX - 8 }}
              >
                <span className="text-[10px] text-[#AAAAAA] dark:text-[#666666]">
                  {format(new Date().setHours(h, 0), 'ha')}
                </span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map((day, dayIdx) => {
            const dayEvents = eventsForDay(day);
            const todayDay = isToday(day);
            return (
              <div
                key={day.toISOString()}
                className="flex-1 relative border-r border-[#E8E7E4] dark:border-white/10"
                style={{ height: totalHeight }}
              >
                {/* Hour lines */}
                {hours.map((h) => (
                  <div
                    key={h}
                    className="absolute left-0 right-0 border-t border-[#E8E7E4] dark:border-white/10 cursor-pointer hover:bg-[#44AADF]/5 transition-colors"
                    style={{ top: (h - HOUR_START) * HOUR_PX, height: HOUR_PX }}
                    onClick={() => onSlotClick(day, h, 0)}
                  />
                ))}

                {/* Current time line */}
                {todayDay && nowTop !== null && (
                  <div
                    className="absolute left-0 right-0 z-20 pointer-events-none"
                    style={{ top: nowTop }}
                  >
                    <div className="relative">
                      <div className="absolute -left-1 -top-1 w-2 h-2 rounded-full bg-[#44AADF]" />
                      <div className="h-0.5 bg-[#44AADF] w-full" />
                    </div>
                  </div>
                )}

                {/* Events */}
                {dayEvents.map((evt) => {
                  const isDragging = dragState?.eventId === evt.id;
                  const displayStart = isDragging ? dragState!.currentStart : evt.start;
                  const displayEnd = isDragging ? dragState!.currentEnd : evt.end;

                  const h = getHours(displayStart);
                  const m = getMinutes(displayStart);
                  const top = Math.max(0, (h - HOUR_START) * HOUR_PX + (m / 60) * HOUR_PX);
                  const mins = differenceInMinutes(displayEnd, displayStart);
                  const height = Math.max(24, (mins / 60) * HOUR_PX);
                  const hex = getColorHex(evt.color);

                  return (
                    <div
                      key={evt.id}
                      className={cn(
                        'absolute left-0.5 right-0.5 rounded overflow-hidden cursor-pointer select-none z-10',
                        isDragging && 'opacity-70 shadow-lg z-20'
                      )}
                      style={{
                        top,
                        height,
                        backgroundColor: `${hex}20`,
                        borderLeft: `3px solid ${hex}`,
                      }}
                      onMouseDown={(e) => handleMouseDown(e, evt, 'move', dayIdx)}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isDragging) onEventClick(evt);
                      }}
                    >
                      <div className="px-1 py-0.5 h-full overflow-hidden">
                        <p className="text-[10px] font-semibold truncate" style={{ color: hex }}>
                          {evt.title}
                        </p>
                        {height > 36 && (
                          <p className="text-[9px] opacity-70 truncate" style={{ color: hex }}>
                            {format(displayStart, 'h:mm')}–{format(displayEnd, 'h:mma')}
                          </p>
                        )}
                      </div>
                      {/* Resize handle */}
                      {!evt.isTask && (
                        <div
                          className="absolute bottom-0 left-0 right-0 h-2 cursor-s-resize flex items-center justify-center"
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            handleMouseDown(e, evt, 'resize', dayIdx);
                          }}
                        >
                          <div className="w-6 h-0.5 rounded-full" style={{ backgroundColor: hex, opacity: 0.5 }} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ── Week View ─────────────────────────────────────────────────────────────────
interface WeekViewProps {
  currentDate: Date;
  events: FlatEvent[];
  onSlotClick: (day: Date, hour: number, minute: number) => void;
  onEventClick: (evt: FlatEvent) => void;
  onEventMove: (eventId: string, newStart: Date) => void;
  onEventResize: (eventId: string, newEnd: Date) => void;
}

const WeekView: React.FC<WeekViewProps> = ({ currentDate, events, onSlotClick, onEventClick, onEventMove, onEventResize }) => {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: weekStart, end: addDays(weekStart, 6) });
  return (
    <TimeGrid
      days={days}
      events={events}
      onSlotClick={onSlotClick}
      onEventClick={onEventClick}
      onEventMove={onEventMove}
      onEventResize={onEventResize}
    />
  );
};

// ── Day View ──────────────────────────────────────────────────────────────────
interface DayViewProps {
  currentDate: Date;
  events: FlatEvent[];
  onSlotClick: (day: Date, hour: number, minute: number) => void;
  onEventClick: (evt: FlatEvent) => void;
  onEventMove: (eventId: string, newStart: Date) => void;
  onEventResize: (eventId: string, newEnd: Date) => void;
}

const DayView: React.FC<DayViewProps> = ({ currentDate, events, onSlotClick, onEventClick, onEventMove, onEventResize }) => (
  <TimeGrid
    days={[currentDate]}
    events={events}
    onSlotClick={onSlotClick}
    onEventClick={onEventClick}
    onEventMove={onEventMove}
    onEventResize={onEventResize}
  />
);

// ── Agenda View ───────────────────────────────────────────────────────────────
interface AgendaViewProps {
  currentDate: Date;
  events: FlatEvent[];
  onEventClick: (evt: FlatEvent) => void;
}

const AgendaView: React.FC<AgendaViewProps> = ({ currentDate, events, onEventClick }) => {
  const days = eachDayOfInterval({
    start: startOfDay(currentDate),
    end: addDays(startOfDay(currentDate), 29),
  });

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {days.map((day) => {
        const dayEvents = events
          .filter((e) => isSameDay(e.start, day))
          .sort((a, b) => a.start.getTime() - b.start.getTime());

        if (dayEvents.length === 0) return null;

        return (
          <div key={day.toISOString()} className="mb-6">
            <div className={cn(
              'text-sm font-semibold mb-2 sticky top-0 py-1 bg-[#F0EFEC] dark:bg-[#242424]',
              isToday(day) ? 'text-[#44AADF]' : 'text-[#333333] dark:text-[#CCCCCC]'
            )}>
              {isToday(day) ? 'Today — ' : ''}{format(day, 'EEEE, MMMM d')}
            </div>
            <div className="space-y-1.5">
              {dayEvents.map((evt) => {
                const hex = getColorHex(evt.color);
                return (
                  <div
                    key={evt.id}
                    onClick={() => onEventClick(evt)}
                    className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-[#2E2E2E] border border-[#E8E7E4] dark:border-white/10 cursor-pointer hover:shadow-sm transition-shadow"
                  >
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: hex }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#111111] dark:text-white truncate">{evt.title}</p>
                      <p className="text-xs text-[#777777] dark:text-[#888888]">
                        {evt.allDay
                          ? 'All day'
                          : `${format(evt.start, 'h:mm a')} – ${format(evt.end, 'h:mm a')}`}
                      </p>
                    </div>
                    <div className="flex -space-x-1 flex-shrink-0">
                      {/* attendees shown implicitly via color */}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      {days.every((d) => events.filter((e) => isSameDay(e.start, d)).length === 0) && (
        <div className="flex flex-col items-center justify-center h-64 text-[#999999] dark:text-[#6B6B6B]">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="mb-3 opacity-40">
            <rect x="6" y="10" width="36" height="32" rx="4" stroke="currentColor" strokeWidth="2" />
            <path d="M6 18h36" stroke="currentColor" strokeWidth="2" />
            <path d="M16 6v8M32 6v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <p className="text-sm">No events in the next 30 days</p>
        </div>
      )}
    </div>
  );
};

// ── Main CalendarPage ─────────────────────────────────────────────────────────
export const CalendarPage: React.FC = () => {
  const { events: calStoreEvents, moveEvent, resizeEvent } = useCalendarStore();
  const allTasks = useTaskStore(useShallow((s) => Object.values(s.tasks)));
  const allUsers = useUserStore(useShallow((s) => Object.values(s.users)));

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [currentView, setCurrentView] = useState<ViewType>('month');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [slotStart, setSlotStart] = useState<Date | undefined>();
  const [slotEnd, setSlotEnd] = useState<Date | undefined>();
  const [slotAllDay, setSlotAllDay] = useState<boolean | undefined>();
  const [hiddenTypes, setHiddenTypes] = useState<Set<string>>(new Set());
  const [hiddenUserIds, setHiddenUserIds] = useState<Set<string>>(new Set());

  // Build flat event list
  const allEvents = useMemo<FlatEvent[]>(() => {
    const calEvents = Object.values(calStoreEvents)
      .filter((e) => !hiddenTypes.has(e.type))
      .filter((e) => !hiddenUserIds.size || e.attendeeIds.some((id) => !hiddenUserIds.has(id)))
      .map((e): FlatEvent => ({
        id: e.id,
        title: e.title,
        start: new Date(e.start),
        end: new Date(e.end),
        allDay: e.allDay,
        color: e.color,
        type: e.type,
        attendeeIds: e.attendeeIds,
        isTask: false,
        calEvent: e,
      }));

    const taskEvents = allTasks
      .filter((t) => t.dueDate && !t.isArchived && !hiddenTypes.has('task'))
      .map((t): FlatEvent => ({
        id: `task-${t.id}`,
        title: t.title,
        start: new Date(t.dueDate!),
        end: new Date(t.dueDate!),
        allDay: true,
        color: 'task',
        type: 'task',
        attendeeIds: t.assigneeId ? [t.assigneeId] : [],
        isTask: true,
      }));

    return [...calEvents, ...taskEvents];
  }, [calStoreEvents, allTasks, hiddenTypes, hiddenUserIds]);

  const eventDates = useMemo(() => allEvents.map((e) => e.start), [allEvents]);

  const openNewEvent = useCallback((start?: Date, end?: Date, allDay?: boolean) => {
    setSelectedEvent(null);
    const s = start ?? new Date();
    const e = end ?? addMinutes(s, 60);
    setSlotStart(s);
    setSlotEnd(e);
    setSlotAllDay(allDay ?? false);
    setModalOpen(true);
  }, []);

  const handleEventClick = useCallback((evt: FlatEvent) => {
    if (evt.isTask) return;
    if (evt.calEvent) {
      setSelectedEvent(evt.calEvent);
      setSlotStart(undefined);
      setSlotEnd(undefined);
      setModalOpen(true);
    }
  }, []);

  const handleDayClick = useCallback((day: Date) => {
    openNewEvent(
      new Date(day.getFullYear(), day.getMonth(), day.getDate(), 9, 0),
      new Date(day.getFullYear(), day.getMonth(), day.getDate(), 10, 0),
      currentView === 'month'
    );
  }, [openNewEvent, currentView]);

  const handleSlotClick = useCallback((day: Date, hour: number, minute: number) => {
    const start = new Date(day);
    start.setHours(hour, minute, 0, 0);
    openNewEvent(start, addMinutes(start, 60), false);
  }, [openNewEvent]);

  const handleEventDropMonth = useCallback((eventId: string, targetDay: Date) => {
    const evt = allEvents.find((e) => e.id === eventId);
    if (!evt || evt.isTask) return;
    const duration = differenceInMinutes(evt.end, evt.start);
    const newStart = new Date(targetDay);
    newStart.setHours(evt.start.getHours(), evt.start.getMinutes(), 0, 0);
    const newEnd = addMinutes(newStart, duration);
    moveEvent(eventId, newStart, newEnd);
  }, [allEvents, moveEvent]);

  const handleEventMove = useCallback((eventId: string, newStart: Date) => {
    const evt = allEvents.find((e) => e.id === eventId);
    if (!evt || evt.isTask) return;
    const duration = differenceInMinutes(evt.end, evt.start);
    const newEnd = addMinutes(newStart, duration);
    moveEvent(eventId, newStart, newEnd);
  }, [allEvents, moveEvent]);

  const handleEventResize = useCallback((eventId: string, newEnd: Date) => {
    const evt = allEvents.find((e) => e.id === eventId);
    if (!evt || evt.isTask) return;
    resizeEvent(eventId, evt.start, newEnd);
  }, [allEvents, resizeEvent]);

  const toggleType = (type: string) => {
    setHiddenTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type); else next.add(type);
      return next;
    });
  };

  const toggleUser = (userId: string) => {
    setHiddenUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId); else next.add(userId);
      return next;
    });
  };

  return (
    <div className="flex h-full bg-[#F0EFEC] dark:bg-[#242424]">
      {/* ── Left Sidebar ── */}
      <div className="w-60 flex-shrink-0 bg-white dark:bg-[#1C1C1C] border-r border-[#D8D6D2] dark:border-white/10 flex flex-col overflow-y-auto">
        {/* New Event */}
        <div className="p-4">
          <button
            onClick={() => openNewEvent()}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#44AADF] text-white text-sm font-semibold hover:bg-[#3A99CE] transition-colors shadow-sm"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            New Event
          </button>
        </div>

        {/* Mini Calendar */}
        <div className="px-4 pb-4">
          <MiniCalendar
            value={currentDate}
            onChange={(date) => {
              setCurrentDate(date);
              if (currentView !== 'month') setCurrentView('day');
            }}
            eventDates={eventDates}
          />
        </div>

        <div className="mx-4 border-t border-[#D8D6D2] dark:border-white/10" />

        {/* My Calendars */}
        <div className="p-4">
          <p className="text-[10px] font-bold text-[#999999] dark:text-[#6B6B6B] uppercase tracking-wider mb-3">
            My Calendars
          </p>
          <div className="space-y-1.5">
            {EVENT_TYPE_COLORS.map((ec) => (
              <label key={ec.type} className="flex items-center gap-2.5 cursor-pointer">
                <div
                  className={cn(
                    'w-3.5 h-3.5 rounded flex items-center justify-center flex-shrink-0 transition-opacity',
                    hiddenTypes.has(ec.type) ? 'opacity-30' : 'opacity-100'
                  )}
                  style={{ backgroundColor: ec.color }}
                  onClick={() => toggleType(ec.type)}
                >
                  {!hiddenTypes.has(ec.type) && (
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                      <path d="M1.5 4l2 2 3-3" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span
                  className={cn(
                    'text-xs text-[#333333] dark:text-[#CCCCCC] transition-opacity',
                    hiddenTypes.has(ec.type) && 'opacity-40'
                  )}
                  onClick={() => toggleType(ec.type)}
                >
                  {ec.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="mx-4 border-t border-[#D8D6D2] dark:border-white/10" />

        {/* Team */}
        <div className="p-4">
          <p className="text-[10px] font-bold text-[#999999] dark:text-[#6B6B6B] uppercase tracking-wider mb-3">
            Team
          </p>
          <div className="space-y-1.5">
            {allUsers.map((user) => (
              <label
                key={user.id}
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => toggleUser(user.id)}
              >
                <div className={cn('transition-opacity', hiddenUserIds.has(user.id) ? 'opacity-30' : 'opacity-100')}>
                  <Avatar user={user} size="xs" />
                </div>
                <span
                  className={cn(
                    'text-xs text-[#333333] dark:text-[#CCCCCC] truncate transition-opacity',
                    hiddenUserIds.has(user.id) && 'opacity-40'
                  )}
                >
                  {user.name}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Area ── */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#FAFAF8] dark:bg-[#2E2E2E]">
        <Toolbar
          date={currentDate}
          view={currentView}
          onPrev={() => setCurrentDate((d) => navigate(d, currentView, -1))}
          onNext={() => setCurrentDate((d) => navigate(d, currentView, 1))}
          onToday={() => setCurrentDate(new Date())}
          onView={setCurrentView}
        />

        {currentView === 'month' && (
          <MonthView
            currentDate={currentDate}
            events={allEvents}
            onDayClick={handleDayClick}
            onEventClick={handleEventClick}
            onEventDrop={handleEventDropMonth}
          />
        )}

        {currentView === 'week' && (
          <WeekView
            currentDate={currentDate}
            events={allEvents}
            onSlotClick={handleSlotClick}
            onEventClick={handleEventClick}
            onEventMove={handleEventMove}
            onEventResize={handleEventResize}
          />
        )}

        {currentView === 'day' && (
          <DayView
            currentDate={currentDate}
            events={allEvents}
            onSlotClick={handleSlotClick}
            onEventClick={handleEventClick}
            onEventMove={handleEventMove}
            onEventResize={handleEventResize}
          />
        )}

        {currentView === 'agenda' && (
          <AgendaView
            currentDate={currentDate}
            events={allEvents}
            onEventClick={handleEventClick}
          />
        )}
      </div>

      {/* Event Modal */}
      <CalendarEventModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedEvent(null); }}
        event={selectedEvent}
        defaultStart={slotStart}
        defaultEnd={slotEnd}
        defaultAllDay={slotAllDay}
      />
    </div>
  );
};
