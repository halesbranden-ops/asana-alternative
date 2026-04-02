import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { User } from '../types';

interface UserState {
  users: Record<string, User>;
  currentUserId: string;
}

interface UserActions {
  seedUsers: (users: User[]) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  getUser: (id: string) => User | undefined;
}

type UserStore = UserState & UserActions;

export const useUserStore = create<UserStore>()(
  persist(
    immer((set, get) => ({
      users: {},
      currentUserId: 'user-1',

      seedUsers: (users) =>
        set((state) => {
          users.forEach((u) => {
            state.users[u.id] = u;
          });
        }),

      updateUser: (id, updates) =>
        set((state) => {
          if (state.users[id]) {
            Object.assign(state.users[id], updates);
          }
        }),

      getUser: (id) => get().users[id],
    })),
    { name: 'bullfit-users-v2' }
  )
);

export const selectCurrentUser = (state: UserStore) => state.users[state.currentUserId];
export const selectUser = (id: string) => (state: UserStore) => state.users[id];
export const selectAllUsers = (state: UserStore) => Object.values(state.users);
