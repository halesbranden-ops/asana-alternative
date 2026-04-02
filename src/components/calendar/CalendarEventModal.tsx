import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { createPortal } from 'react-dom';
import { cn } from '../../utils/cn';
import { useShallow } from 'zustand/react/shallow';
import { useCalendarStore, CalendarEvent, EventColor, EventType } from '../../store/calendarStore';
import { useUserStore } from '../../store/userStore';
import { useTaskStore } from '../../store/taskStore';
import { Avatar } from '../ui/Avatar';

interface CalendarEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event?: CalendarEvent | null;
  defaultStart?: Date;
  defaultEnd?: Date;
  defaultAllDay?: boolean;
}

const EVENT_COLORS: { value: EventColor; hex: string; label: string }[] = [
  { value: 'blue',   hex: '#44AADF', label: 'Blue' },
  { value: 'purple', hex: '#8B5CF6', label: 'Purple' },
  { value: 'pink',   hex: '#EC4899', label: 'Pink' },
  { value: 'green',  hex: '#22C55E', label: 'Green' },
  { value: 'yellow', hex: '#EAB308', label: 'Yellow' },
  { value: 'red',    hex: '#EF4444', label: 'Red' },
];

const EVENT_TYPES: { value: EventType; label: string; icon: React.ReactNode }[] = [
  { value: 'meeting',  label: 'Meeting',  icon: <MeetingIcon /> },
  { value: 'task',     label: 'Task',     icon: <TaskIcon /> },
  { value: 'deadline', label: 'Deadline', icon: <DeadlineIcon /> },
  { value: 'reminder', label: 'Reminder', icon: <ReminderIcon /> },
  { value: 'other',    label: 'Other',    icon: <OtherIcon /> },
];

function toLocalInputValue(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toDateInputValue(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export const CalendarEventModal: React.FC<CalendarEventModalProps> = ({
  isOpen,
  onClose,
  event,
  defaultStart,
  defaultEnd,
  defaultAllDay,
}) => {
  const { createEvent, updateEvent, deleteEvent } = useCalendarStore();
  const allUsers = useUserStore(useShallow((s) => Object.values(s.users)));
  const allTasks = useTaskStore(useShallow((s) => Object.values(s.tasks).filter((t) => !t.isArchived)));

  const isEditing = !!event;

  const getDefaultStart = () => {
    if (event) return new Date(event.start);
    if (defaultStart) return defaultStart;
    return new Date();
  };
  const getDefaultEnd = () => {
    if (event) return new Date(event.end);
    if (defaultEnd) return defaultEnd;
    const d = new Date();
    d.setHours(d.getHours() + 1);
    return d;
  };

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startStr, setStartStr] = useState('');
  const [endStr, setEndStr] = useState('');
  const [allDay, setAllDay] = useState(false);
  const [color, setColor] = useState<EventColor>('blue');
  const [type, setType] = useState<EventType>('meeting');
  const [attendeeIds, setAttendeeIds] = useState<string[]>(['user-1']);
  const [linkedTaskId, setLinkedTaskId] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setShowDeleteConfirm(false);
      return;
    }
    const s = getDefaultStart();
    const e = getDefaultEnd();
    const ad = event ? event.allDay : (defaultAllDay ?? false);

    setTitle(event?.title || '');
    setDescription(event?.description || '');
    setAllDay(ad);
    setStartStr(ad ? toDateInputValue(s.toISOString()) : toLocalInputValue(s.toISOString()));
    setEndStr(ad ? toDateInputValue(e.toISOString()) : toLocalInputValue(e.toISOString()));
    setColor(event?.color || 'blue');
    setType(event?.type || 'meeting');
    setAttendeeIds(event?.attendeeIds || ['user-1']);
    setLinkedTaskId(event?.linkedTaskId || null);
    setUserSearch('');
  }, [isOpen, event]);

  useEffect(() => {
    if (!isOpen) return;
    const s = getDefaultStart();
    const e = getDefaultEnd();
    if (allDay) {
      setStartStr(toDateInputValue(s.toISOString()));
      setEndStr(toDateInputValue(e.toISOString()));
    } else {
      setStartStr(toLocalInputValue(s.toISOString()));
      setEndStr(toLocalInputValue(e.toISOString()));
    }
  }, [allDay]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!title.trim()) return;

    const parseDate = (str: string) => {
      if (allDay) {
        const [y, m, d] = str.split('-').map(Number);
        return new Date(y, m - 1, d).toISOString();
      }
      return new Date(str).toISOString();
    };

    const data: Partial<CalendarEvent> = {
      title: title.trim(),
      description,
      start: parseDate(startStr),
      end: parseDate(endStr),
      allDay,
      color,
      type,
      attendeeIds,
      linkedTaskId,
    };

    if (isEditing && event) {
      updateEvent(event.id, data);
    } else {
      createEvent(data);
    }
    onClose();
  };

  const handleDelete = () => {
    if (!showDeleteConfirm) { setShowDeleteConfirm(true); return; }
    if (event) deleteEvent(event.id);
    onClose();
  };

  const toggleAttendee = (userId: string) => {
    setAttendeeIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const filteredUsers = allUsers.filter((u) =>
    userSearch ? u.name.toLowerCase().includes(userSearch.toLowerCase()) : true
  );

  const currentColor = EVENT_COLORS.find((c) => c.value === color)?.hex || '#44AADF';

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-[#2E2E2E] border border-[#D8D6D2] dark:border-white/10 rounded-xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center gap-3 p-5 border-b border-[#D8D6D2] dark:border-white/10 flex-shrink-0">
          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: currentColor }} />
          <h2 className="text-base font-semibold text-[#111111] dark:text-white flex-1">
            {isEditing ? 'Edit Event' : 'New Event'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#555555] dark:text-[#A0A0A0] hover:text-[#111111] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-5 space-y-5">
          {/* Title */}
          <div>
            <input
              type="text"
              placeholder="Event title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-lg font-semibold bg-transparent text-[#111111] dark:text-white placeholder-[#AAAAAA] dark:placeholder-[#666666] outline-none border-b border-[#D8D6D2] dark:border-white/10 pb-2 focus:border-[#44AADF] transition-colors"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <textarea
              placeholder="Add description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full text-sm bg-transparent text-[#333333] dark:text-[#CCCCCC] placeholder-[#AAAAAA] dark:placeholder-[#666666] outline-none resize-none border border-[#D8D6D2] dark:border-white/10 rounded-lg p-3 focus:border-[#44AADF] transition-colors"
            />
          </div>

          {/* All Day */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#555555] dark:text-[#A0A0A0]">All day</span>
            <button
              onClick={() => setAllDay(!allDay)}
              className={cn(
                'px-3 py-1 rounded-md text-xs font-medium border transition-colors duration-150',
                allDay
                  ? 'bg-[#44AADF] border-[#44AADF] text-white'
                  : 'bg-transparent border-[#D8D6D2] dark:border-white/20 text-[#555555] dark:text-[#A0A0A0] hover:border-[#44AADF] hover:text-[#44AADF]'
              )}
            >
              {allDay ? 'On' : 'Off'}
            </button>
          </div>

          {/* Date/Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#777777] dark:text-[#888888] mb-1">
                Start
              </label>
              <input
                type={allDay ? 'date' : 'datetime-local'}
                value={startStr}
                onChange={(e) => setStartStr(e.target.value)}
                className="w-full text-sm bg-[#F0EFEC] dark:bg-[#242424] text-[#111111] dark:text-white border border-[#D8D6D2] dark:border-white/10 rounded-lg px-3 py-2 outline-none focus:border-[#44AADF] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#777777] dark:text-[#888888] mb-1">
                End
              </label>
              <input
                type={allDay ? 'date' : 'datetime-local'}
                value={endStr}
                onChange={(e) => setEndStr(e.target.value)}
                className="w-full text-sm bg-[#F0EFEC] dark:bg-[#242424] text-[#111111] dark:text-white border border-[#D8D6D2] dark:border-white/10 rounded-lg px-3 py-2 outline-none focus:border-[#44AADF] transition-colors"
              />
            </div>
          </div>

          {/* Event Type */}
          <div>
            <label className="block text-xs font-medium text-[#777777] dark:text-[#888888] mb-2">
              Event Type
            </label>
            <div className="flex gap-2 flex-wrap">
              {EVENT_TYPES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setType(t.value)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                    type === t.value
                      ? 'border-[#44AADF] bg-[#44AADF]/10 text-[#44AADF]'
                      : 'border-[#D8D6D2] dark:border-white/10 text-[#555555] dark:text-[#A0A0A0] hover:border-[#44AADF]/50'
                  )}
                >
                  {t.icon}
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-xs font-medium text-[#777777] dark:text-[#888888] mb-2">
              Color Label
            </label>
            <div className="flex gap-2">
              {EVENT_COLORS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setColor(c.value)}
                  title={c.label}
                  className={cn(
                    'w-7 h-7 rounded-full transition-all',
                    color === c.value ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-[#2E2E2E] scale-110' : 'hover:scale-105'
                  )}
                  style={{
                    backgroundColor: c.hex,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Attendees */}
          <div>
            <label className="block text-xs font-medium text-[#777777] dark:text-[#888888] mb-2">
              Attendees
            </label>
            {attendeeIds.length > 0 && (
              <div className="flex gap-1.5 flex-wrap mb-2">
                {attendeeIds.map((uid) => {
                  const user = allUsers.find((u) => u.id === uid);
                  if (!user) return null;
                  return (
                    <div key={uid} className="flex items-center gap-1.5 bg-[#F0EFEC] dark:bg-[#242424] px-2 py-1 rounded-full">
                      <Avatar user={user} size="xs" />
                      <span className="text-xs text-[#333333] dark:text-[#CCCCCC]">{user.name}</span>
                      <button
                        onClick={() => toggleAttendee(uid)}
                        className="text-[#999999] hover:text-[#EF4444] transition-colors"
                      >
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M7.5 2.5l-5 5M2.5 2.5l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            <input
              type="text"
              placeholder="Search team members..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="w-full text-sm bg-[#F0EFEC] dark:bg-[#242424] text-[#111111] dark:text-white border border-[#D8D6D2] dark:border-white/10 rounded-lg px-3 py-2 outline-none focus:border-[#44AADF] transition-colors mb-2"
            />
            <div className="max-h-28 overflow-y-auto space-y-1">
              {filteredUsers.filter((u) => !attendeeIds.includes(u.id)).map((user) => (
                <button
                  key={user.id}
                  onClick={() => toggleAttendee(user.id)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[#F0EFEC] dark:hover:bg-[#242424] transition-colors text-left"
                >
                  <Avatar user={user} size="xs" />
                  <div>
                    <p className="text-xs font-medium text-[#111111] dark:text-white">{user.name}</p>
                    <p className="text-[10px] text-[#999999] dark:text-[#6B6B6B]">{user.role}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Linked Task */}
          <div>
            <label className="block text-xs font-medium text-[#777777] dark:text-[#888888] mb-2">
              Linked Task
            </label>
            <select
              value={linkedTaskId || ''}
              onChange={(e) => setLinkedTaskId(e.target.value || null)}
              className="w-full text-sm bg-[#F0EFEC] dark:bg-[#242424] text-[#111111] dark:text-white border border-[#D8D6D2] dark:border-white/10 rounded-lg px-3 py-2 outline-none focus:border-[#44AADF] transition-colors"
            >
              <option value="">No linked task</option>
              {allTasks.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-5 border-t border-[#D8D6D2] dark:border-white/10 flex-shrink-0 gap-3">
          {isEditing ? (
            <button
              onClick={handleDelete}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                showDeleteConfirm
                  ? 'bg-[#EF4444] text-white hover:bg-[#DC2626]'
                  : 'text-[#EF4444] hover:bg-[#EF4444]/10'
              )}
            >
              {showDeleteConfirm ? 'Confirm Delete' : 'Delete'}
            </button>
          ) : (
            <div />
          )}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-[#555555] dark:text-[#A0A0A0] hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!title.trim()}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-[#44AADF] text-white hover:bg-[#3A99CE] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {isEditing ? 'Save Changes' : 'Create Event'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

// Icon components
function MeetingIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <circle cx="4" cy="3.5" r="1.5" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="8" cy="3.5" r="1.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M1 9.5c0-1.5 1.3-2.5 3-2.5s3 1 3 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M8 7.5c1 0 2.5.6 2.5 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function TaskIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <rect x="1.5" y="1.5" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M3.5 6l2 2 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DeadlineIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M6 3.5V6l1.5 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ReminderIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M6 1.5a4 4 0 00-4 4v2l-1 1.5h10l-1-1.5v-2a4 4 0 00-4-4z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M4.5 9.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function OtherIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <circle cx="6" cy="6" r="1" fill="currentColor" />
      <circle cx="2" cy="6" r="1" fill="currentColor" />
      <circle cx="10" cy="6" r="1" fill="currentColor" />
    </svg>
  );
}
