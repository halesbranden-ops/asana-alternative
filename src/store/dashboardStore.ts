import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type WidgetType =
  | 'stats'
  | 'task_completion'
  | 'workload'
  | 'project_health'
  | 'my_tasks'
  | 'upcoming'
  | 'activity'
  | 'calendar';

export interface WidgetConfig {
  id: string;
  type: WidgetType;
}

export const WIDGET_META: Record<WidgetType, { label: string; description: string; icon: string; defaultColumn: 'main' | 'sidebar' }> = {
  stats:          { label: 'Quick Stats',           description: 'Key metrics: in progress, overdue, done, active projects', icon: '📊', defaultColumn: 'main' },
  task_completion:{ label: 'Task Completion',        description: 'Weekly bar chart of completed tasks',                      icon: '✅', defaultColumn: 'main' },
  workload:       { label: 'Team Workload',          description: 'Task distribution across team members',                    icon: '👥', defaultColumn: 'main' },
  project_health: { label: 'Project Health',         description: 'Status overview of all active projects',                   icon: '🏗️', defaultColumn: 'main' },
  my_tasks:       { label: 'My Tasks',               description: 'Your high-priority and overdue tasks at a glance',         icon: '🎯', defaultColumn: 'sidebar' },
  upcoming:       { label: 'Upcoming Deadlines',     description: 'Tasks due in the next 7 days',                             icon: '📅', defaultColumn: 'sidebar' },
  activity:       { label: 'Recent Activity',        description: 'Latest team notifications and updates',                    icon: '🔔', defaultColumn: 'sidebar' },
  calendar:       { label: 'Calendar',               description: 'Monthly calendar with task due-date indicators',           icon: '🗓️', defaultColumn: 'sidebar' },
};

const DEFAULT_MAIN: WidgetConfig[] = [
  { id: 'stats',           type: 'stats' },
  { id: 'calendar',        type: 'calendar' },
  { id: 'task_completion', type: 'task_completion' },
  { id: 'workload',        type: 'workload' },
  { id: 'project_health',  type: 'project_health' },
];

const DEFAULT_SIDE: WidgetConfig[] = [
  { id: 'my_tasks', type: 'my_tasks' },
  { id: 'upcoming', type: 'upcoming' },
  { id: 'activity', type: 'activity' },
];

interface DashboardState {
  mainWidgets: WidgetConfig[];
  sideWidgets: WidgetConfig[];
  isEditMode: boolean;
  setMainWidgets: (widgets: WidgetConfig[]) => void;
  setSideWidgets: (widgets: WidgetConfig[]) => void;
  addWidget: (type: WidgetType, column: 'main' | 'sidebar') => void;
  removeWidget: (id: string) => void;
  setEditMode: (v: boolean) => void;
  resetToDefault: () => void;
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      mainWidgets: DEFAULT_MAIN,
      sideWidgets: DEFAULT_SIDE,
      isEditMode: false,

      setMainWidgets: (widgets) => set({ mainWidgets: widgets }),
      setSideWidgets: (widgets) => set({ sideWidgets: widgets }),

      addWidget: (type, column) => {
        const id = `${type}_${Date.now()}`;
        const widget: WidgetConfig = { id, type };
        if (column === 'main') {
          set((s) => ({ mainWidgets: [...s.mainWidgets, widget] }));
        } else {
          set((s) => ({ sideWidgets: [...s.sideWidgets, widget] }));
        }
      },

      removeWidget: (id) =>
        set((s) => ({
          mainWidgets: s.mainWidgets.filter((w) => w.id !== id),
          sideWidgets: s.sideWidgets.filter((w) => w.id !== id),
        })),

      setEditMode: (v) => set({ isEditMode: v }),

      resetToDefault: () =>
        set({ mainWidgets: DEFAULT_MAIN, sideWidgets: DEFAULT_SIDE }),
    }),
    { name: 'bullfit-dashboard-v2' }
  )
);
