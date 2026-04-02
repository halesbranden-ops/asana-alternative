import { create } from 'zustand';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

type Theme = 'dark' | 'light';

function applyTheme(theme: Theme) {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  localStorage.setItem('bullfit-theme', theme);
}

function getInitialTheme(): Theme {
  const stored = localStorage.getItem('bullfit-theme') as Theme | null;
  if (stored === 'light' || stored === 'dark') return stored;
  return 'light'; // default to light
}

interface UIState {
  isTaskDetailOpen: boolean;
  taskDetailId: string | null;
  isTaskCreateModalOpen: boolean;
  taskCreateProjectId: string | null;
  taskCreateSectionId: string | null;
  isSearchOpen: boolean;
  sidebarCollapsed: boolean;
  isProjectCreateModalOpen: boolean;
  activeView: 'list' | 'board' | 'calendar' | 'timeline' | 'overview';
  toasts: Toast[];
  isStatusUpdateModalOpen: boolean;
  statusUpdateProjectId: string | null;
  isProjectEditModalOpen: boolean;
  projectEditId: string | null;
  theme: Theme;
}

interface UIActions {
  openTaskDetail: (taskId: string) => void;
  closeTaskDetail: () => void;
  openTaskCreate: (projectId?: string, sectionId?: string) => void;
  closeTaskCreate: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  openProjectCreate: () => void;
  closeProjectCreate: () => void;
  setActiveView: (view: UIState['activeView']) => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  openStatusUpdate: (projectId: string) => void;
  closeStatusUpdate: () => void;
  openProjectEdit: (projectId: string) => void;
  closeProjectEdit: () => void;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

type UIStore = UIState & UIActions;

let toastCounter = 0;

const initialTheme = getInitialTheme();
applyTheme(initialTheme);

export const useUIStore = create<UIStore>((set) => ({
  isTaskDetailOpen: false,
  taskDetailId: null,
  isTaskCreateModalOpen: false,
  taskCreateProjectId: null,
  taskCreateSectionId: null,
  isSearchOpen: false,
  sidebarCollapsed: false,
  isProjectCreateModalOpen: false,
  activeView: 'list',
  toasts: [],
  isStatusUpdateModalOpen: false,
  statusUpdateProjectId: null,
  isProjectEditModalOpen: false,
  projectEditId: null,
  theme: initialTheme,

  openTaskDetail: (taskId) =>
    set({ isTaskDetailOpen: true, taskDetailId: taskId }),

  closeTaskDetail: () =>
    set({ isTaskDetailOpen: false, taskDetailId: null }),

  openTaskCreate: (projectId, sectionId) =>
    set({
      isTaskCreateModalOpen: true,
      taskCreateProjectId: projectId || null,
      taskCreateSectionId: sectionId || null,
    }),

  closeTaskCreate: () =>
    set({ isTaskCreateModalOpen: false, taskCreateProjectId: null, taskCreateSectionId: null }),

  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false }),

  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

  openProjectCreate: () => set({ isProjectCreateModalOpen: true }),
  closeProjectCreate: () => set({ isProjectCreateModalOpen: false }),

  setActiveView: (view) => set({ activeView: view }),

  addToast: (toast) => {
    const id = `toast-${++toastCounter}`;
    const newToast: Toast = { ...toast, id };
    set((state) => ({ toasts: [...state.toasts, newToast] }));
    const duration = toast.duration ?? 3000;
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
      }, duration);
    }
  },

  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

  openStatusUpdate: (projectId) =>
    set({ isStatusUpdateModalOpen: true, statusUpdateProjectId: projectId }),

  closeStatusUpdate: () =>
    set({ isStatusUpdateModalOpen: false, statusUpdateProjectId: null }),

  openProjectEdit: (projectId) =>
    set({ isProjectEditModalOpen: true, projectEditId: projectId }),

  closeProjectEdit: () =>
    set({ isProjectEditModalOpen: false, projectEditId: null }),

  toggleTheme: () =>
    set((state) => {
      const newTheme: Theme = state.theme === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme);
      return { theme: newTheme };
    }),

  setTheme: (theme) => {
    applyTheme(theme);
    set({ theme });
  },
}));
