import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { Goal } from '../types';

interface GoalState {
  goals: Record<string, Goal>;
}

interface GoalActions {
  seedGoals: (goals: Goal[]) => void;
  createGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => Goal;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  updateProgress: (id: string, progress: number) => void;
}

type GoalStore = GoalState & GoalActions;

export const useGoalStore = create<GoalStore>()(
  persist(
    immer((set) => ({
      goals: {},

      seedGoals: (goals) =>
        set((state) => {
          goals.forEach((g) => {
            state.goals[g.id] = g;
          });
        }),

      createGoal: (data) => {
        const now = new Date().toISOString();
        const newGoal: Goal = { ...data, id: `goal-${Date.now()}`, createdAt: now, updatedAt: now };
        set((state) => { state.goals[newGoal.id] = newGoal; });
        return newGoal;
      },

      updateGoal: (id, updates) =>
        set((state) => {
          if (state.goals[id]) {
            Object.assign(state.goals[id], { ...updates, updatedAt: new Date().toISOString() });
          }
        }),

      deleteGoal: (id) =>
        set((state) => { delete state.goals[id]; }),

      updateProgress: (id, progress) =>
        set((state) => {
          if (state.goals[id]) {
            state.goals[id].progress = Math.min(100, Math.max(0, progress));
            state.goals[id].updatedAt = new Date().toISOString();
          }
        }),
    })),
    { name: 'bullfit-goals-v2' }
  )
);

export const selectAllGoals = (state: GoalStore) => Object.values(state.goals);
export const selectGoal = (id: string) => (state: GoalStore) => state.goals[id];
