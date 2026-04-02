import { create } from 'zustand';
import { Task, Project, User } from '../types';
import { CalendarEvent } from './calendarStore';

interface SearchResult {
  tasks: Task[];
  projects: Project[];
  users: User[];
  events: CalendarEvent[];
}

interface SearchState {
  query: string;
  results: SearchResult;
  isLoading: boolean;
  recentSearches: string[];
}

interface SearchActions {
  setQuery: (query: string) => void;
  setResults: (results: SearchResult) => void;
  setLoading: (loading: boolean) => void;
  addRecentSearch: (query: string) => void;
  removeRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  clearSearch: () => void;
}

type SearchStore = SearchState & SearchActions;

function loadRecentSearches(): string[] {
  try {
    return JSON.parse(localStorage.getItem('bullfit-recent-searches') || '[]');
  } catch {
    return [];
  }
}

export const useSearchStore = create<SearchStore>((set) => ({
  query: '',
  results: { tasks: [], projects: [], users: [], events: [] },
  isLoading: false,
  recentSearches: loadRecentSearches(),

  setQuery: (query) => set({ query }),
  setResults: (results) => set({ results }),
  setLoading: (isLoading) => set({ isLoading }),

  addRecentSearch: (query) =>
    set((state) => {
      const updated = [query, ...state.recentSearches.filter((s) => s !== query)].slice(0, 8);
      localStorage.setItem('bullfit-recent-searches', JSON.stringify(updated));
      return { recentSearches: updated };
    }),

  removeRecentSearch: (query) =>
    set((state) => {
      const updated = state.recentSearches.filter((s) => s !== query);
      localStorage.setItem('bullfit-recent-searches', JSON.stringify(updated));
      return { recentSearches: updated };
    }),

  clearRecentSearches: () => {
    localStorage.removeItem('bullfit-recent-searches');
    set({ recentSearches: [] });
  },

  clearSearch: () =>
    set({ query: '', results: { tasks: [], projects: [], users: [], events: [] }, isLoading: false }),
}));
