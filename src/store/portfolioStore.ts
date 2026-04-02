import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { Portfolio } from '../types';

interface PortfolioState {
  portfolios: Record<string, Portfolio>;
}

interface PortfolioActions {
  seedPortfolios: (portfolios: Portfolio[]) => void;
  createPortfolio: (portfolio: Omit<Portfolio, 'id' | 'createdAt' | 'updatedAt'>) => Portfolio;
  updatePortfolio: (id: string, updates: Partial<Portfolio>) => void;
  deletePortfolio: (id: string) => void;
  addProject: (portfolioId: string, projectId: string) => void;
  removeProject: (portfolioId: string, projectId: string) => void;
}

type PortfolioStore = PortfolioState & PortfolioActions;

export const usePortfolioStore = create<PortfolioStore>()(
  persist(
    immer((set) => ({
      portfolios: {},

      seedPortfolios: (portfolios) =>
        set((state) => {
          portfolios.forEach((p) => {
            state.portfolios[p.id] = p;
          });
        }),

      createPortfolio: (data) => {
        const now = new Date().toISOString();
        const newPortfolio: Portfolio = { ...data, id: `portfolio-${Date.now()}`, createdAt: now, updatedAt: now };
        set((state) => { state.portfolios[newPortfolio.id] = newPortfolio; });
        return newPortfolio;
      },

      updatePortfolio: (id, updates) =>
        set((state) => {
          if (state.portfolios[id]) {
            Object.assign(state.portfolios[id], { ...updates, updatedAt: new Date().toISOString() });
          }
        }),

      deletePortfolio: (id) =>
        set((state) => { delete state.portfolios[id]; }),

      addProject: (portfolioId, projectId) =>
        set((state) => {
          if (state.portfolios[portfolioId] && !state.portfolios[portfolioId].projectIds.includes(projectId)) {
            state.portfolios[portfolioId].projectIds.push(projectId);
          }
        }),

      removeProject: (portfolioId, projectId) =>
        set((state) => {
          if (state.portfolios[portfolioId]) {
            state.portfolios[portfolioId].projectIds = state.portfolios[portfolioId].projectIds.filter(
              (id) => id !== projectId
            );
          }
        }),
    })),
    { name: 'bullfit-portfolios-v2' }
  )
);

export const selectAllPortfolios = (state: PortfolioStore) => Object.values(state.portfolios);
