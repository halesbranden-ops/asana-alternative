import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { Team } from '../types';

interface TeamState {
  teams: Record<string, Team>;
}

interface TeamActions {
  seedTeams: (teams: Team[]) => void;
  createTeam: (team: Omit<Team, 'id' | 'createdAt'>) => Team;
  updateTeam: (id: string, updates: Partial<Team>) => void;
  deleteTeam: (id: string) => void;
  addMember: (teamId: string, userId: string) => void;
  removeMember: (teamId: string, userId: string) => void;
}

type TeamStore = TeamState & TeamActions;

export const useTeamStore = create<TeamStore>()(
  persist(
    immer((set) => ({
      teams: {},

      seedTeams: (teams) =>
        set((state) => {
          teams.forEach((t) => {
            state.teams[t.id] = t;
          });
        }),

      createTeam: (teamData) => {
        const newTeam: Team = {
          ...teamData,
          id: `team-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        set((state) => {
          state.teams[newTeam.id] = newTeam;
        });
        return newTeam;
      },

      updateTeam: (id, updates) =>
        set((state) => {
          if (state.teams[id]) {
            Object.assign(state.teams[id], updates);
          }
        }),

      deleteTeam: (id) =>
        set((state) => {
          delete state.teams[id];
        }),

      addMember: (teamId, userId) =>
        set((state) => {
          if (state.teams[teamId] && !state.teams[teamId].memberIds.includes(userId)) {
            state.teams[teamId].memberIds.push(userId);
          }
        }),

      removeMember: (teamId, userId) =>
        set((state) => {
          if (state.teams[teamId]) {
            state.teams[teamId].memberIds = state.teams[teamId].memberIds.filter((id) => id !== userId);
          }
        }),
    })),
    { name: 'bullfit-teams-v2' }
  )
);

export const selectAllTeams = (state: TeamStore) => Object.values(state.teams);
export const selectTeam = (id: string) => (state: TeamStore) => state.teams[id];
