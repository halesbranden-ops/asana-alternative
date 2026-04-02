import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { Task, TaskFilter, TaskSortBy, TaskGroupBy } from '../types';
import { generateId } from '../utils/id.utils';

interface TaskState {
  tasks: Record<string, Task>;
  filters: TaskFilter;
  sortBy: TaskSortBy;
  groupBy: TaskGroupBy;
  activeTaskId: string | null;
}

interface TaskActions {
  seedTasks: (tasks: Task[]) => void;
  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  completeTask: (id: string) => void;
  uncompleteTask: (id: string) => void;
  moveTask: (taskId: string, sectionId: string, position: number) => void;
  reorderTasks: (sectionId: string, taskIds: string[]) => void;
  addSubtask: (parentId: string, subtask: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Task;
  setFilters: (filters: Partial<TaskFilter>) => void;
  clearFilters: () => void;
  setSortBy: (sortBy: TaskSortBy) => void;
  setGroupBy: (groupBy: TaskGroupBy) => void;
  setActiveTask: (id: string | null) => void;
  addComment: (taskId: string, commentId: string) => void;
}

type TaskStore = TaskState & TaskActions;

export const useTaskStore = create<TaskStore>()(
  persist(
    immer((set, get) => ({
      tasks: {},
      filters: {},
      sortBy: 'position' as TaskSortBy,
      groupBy: 'none' as TaskGroupBy,
      activeTaskId: null,

      seedTasks: (tasks) =>
        set((state) => {
          tasks.forEach((t) => {
            state.tasks[t.id] = t;
          });
        }),

      createTask: (taskData) => {
        const now = new Date().toISOString();
        const newTask: Task = {
          ...taskData,
          id: generateId('task'),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => {
          state.tasks[newTask.id] = newTask;
        });
        return newTask;
      },

      updateTask: (id, updates) =>
        set((state) => {
          if (state.tasks[id]) {
            Object.assign(state.tasks[id], { ...updates, updatedAt: new Date().toISOString() });
          }
        }),

      deleteTask: (id) =>
        set((state) => {
          const task = state.tasks[id];
          if (!task) return;
          // Remove from parent subtask list
          if (task.parentTaskId && state.tasks[task.parentTaskId]) {
            state.tasks[task.parentTaskId].subtaskIds = state.tasks[task.parentTaskId].subtaskIds.filter(
              (sid) => sid !== id
            );
          }
          delete state.tasks[id];
        }),

      completeTask: (id) =>
        set((state) => {
          if (state.tasks[id]) {
            state.tasks[id].status = 'done';
            state.tasks[id].completedAt = new Date().toISOString();
            state.tasks[id].updatedAt = new Date().toISOString();
          }
        }),

      uncompleteTask: (id) =>
        set((state) => {
          if (state.tasks[id]) {
            state.tasks[id].status = 'todo';
            state.tasks[id].completedAt = null;
            state.tasks[id].updatedAt = new Date().toISOString();
          }
        }),

      moveTask: (taskId, sectionId, position) =>
        set((state) => {
          if (state.tasks[taskId]) {
            state.tasks[taskId].sectionId = sectionId;
            state.tasks[taskId].position = position;
            state.tasks[taskId].updatedAt = new Date().toISOString();
          }
        }),

      reorderTasks: (sectionId, taskIds) =>
        set((state) => {
          taskIds.forEach((taskId, index) => {
            if (state.tasks[taskId]) {
              state.tasks[taskId].position = index;
              state.tasks[taskId].sectionId = sectionId;
            }
          });
        }),

      addSubtask: (parentId, subtaskData) => {
        const now = new Date().toISOString();
        const newTask: Task = {
          ...subtaskData,
          id: generateId('task'),
          parentTaskId: parentId,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => {
          state.tasks[newTask.id] = newTask;
          if (state.tasks[parentId]) {
            state.tasks[parentId].subtaskIds.push(newTask.id);
          }
        });
        return newTask;
      },

      setFilters: (filters) =>
        set((state) => {
          Object.assign(state.filters, filters);
        }),

      clearFilters: () =>
        set((state) => {
          state.filters = {};
        }),

      setSortBy: (sortBy) =>
        set((state) => {
          state.sortBy = sortBy;
        }),

      setGroupBy: (groupBy) =>
        set((state) => {
          state.groupBy = groupBy;
        }),

      setActiveTask: (id) =>
        set((state) => {
          state.activeTaskId = id;
        }),

      addComment: (taskId, commentId) =>
        set((state) => {
          if (state.tasks[taskId]) {
            state.tasks[taskId].commentIds.push(commentId);
          }
        }),
    })),
    {
      name: 'bullfit-tasks-v2',
    }
  )
);

// Selectors
export const selectProjectTasks = (projectId: string) => (state: TaskStore) =>
  Object.values(state.tasks).filter((t) => t.projectId === projectId && !t.isArchived);

export const selectSectionTasks = (sectionId: string) => (state: TaskStore) =>
  Object.values(state.tasks)
    .filter((t) => t.sectionId === sectionId && !t.parentTaskId && !t.isArchived)
    .sort((a, b) => a.position - b.position);

export const selectMyTasks = (userId: string) => (state: TaskStore) =>
  Object.values(state.tasks).filter(
    (t) => t.assigneeId === userId && !t.isArchived && t.status !== 'done'
  );

export const selectTask = (id: string) => (state: TaskStore) => state.tasks[id];

export const selectSubtasks = (parentId: string) => (state: TaskStore) => {
  const parent = state.tasks[parentId];
  if (!parent) return [];
  return parent.subtaskIds.map((id) => state.tasks[id]).filter(Boolean);
};
