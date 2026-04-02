import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { nanoid } from 'nanoid';

export type EventColor = 'blue' | 'purple' | 'pink' | 'green' | 'yellow' | 'red';
export type EventType = 'meeting' | 'task' | 'deadline' | 'reminder' | 'other';

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  start: string; // ISO string
  end: string;   // ISO string
  allDay: boolean;
  color: EventColor;
  type: EventType;
  attendeeIds: string[];
  linkedTaskId: string | null;
  createdById: string;
  createdAt: string;
}

interface CalendarStore {
  events: Record<string, CalendarEvent>;
  createEvent: (data: Partial<CalendarEvent>) => CalendarEvent;
  updateEvent: (id: string, data: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
  moveEvent: (id: string, start: Date, end: Date) => void;
  resizeEvent: (id: string, start: Date, end: Date) => void;
}

export const useCalendarStore = create<CalendarStore>()(
  persist(
    immer((set) => ({
      events: {},
      createEvent: (data) => {
        const event: CalendarEvent = {
          id: nanoid(),
          title: data.title || 'New Event',
          description: data.description || '',
          start: data.start || new Date().toISOString(),
          end: data.end || new Date().toISOString(),
          allDay: data.allDay ?? false,
          color: data.color || 'blue',
          type: data.type || 'meeting',
          attendeeIds: data.attendeeIds || ['user-1'],
          linkedTaskId: data.linkedTaskId || null,
          createdById: 'user-1',
          createdAt: new Date().toISOString(),
        };
        set((s) => { s.events[event.id] = event; });
        return event;
      },
      updateEvent: (id, data) => set((s) => { Object.assign(s.events[id], data); }),
      deleteEvent: (id) => set((s) => { delete s.events[id]; }),
      moveEvent: (id, start, end) => set((s) => {
        s.events[id].start = start.toISOString();
        s.events[id].end = end.toISOString();
      }),
      resizeEvent: (id, start, end) => set((s) => {
        s.events[id].start = start.toISOString();
        s.events[id].end = end.toISOString();
      }),
    })),
    { name: 'bullfit-calendar-v2' }
  )
);
