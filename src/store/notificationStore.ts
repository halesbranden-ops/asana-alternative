import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { Notification } from '../types';

interface NotificationState {
  notifications: Record<string, Notification>;
}

interface NotificationActions {
  seedNotifications: (notifications: Notification[]) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Notification) => void;
  deleteNotification: (id: string) => void;
}

type NotificationStore = NotificationState & NotificationActions;

export const useNotificationStore = create<NotificationStore>()(
  persist(
    immer((set) => ({
      notifications: {},

      seedNotifications: (notifications) =>
        set((state) => {
          notifications.forEach((n) => {
            state.notifications[n.id] = n;
          });
        }),

      markAsRead: (id) =>
        set((state) => {
          if (state.notifications[id]) {
            state.notifications[id].isRead = true;
          }
        }),

      markAllAsRead: () =>
        set((state) => {
          Object.values(state.notifications).forEach((n) => {
            n.isRead = true;
          });
        }),

      addNotification: (notification) =>
        set((state) => {
          state.notifications[notification.id] = notification;
        }),

      deleteNotification: (id) =>
        set((state) => {
          delete state.notifications[id];
        }),
    })),
    { name: 'bullfit-notifications-v2' }
  )
);

export const selectUnreadCount = (state: NotificationStore) =>
  Object.values(state.notifications).filter((n) => !n.isRead).length;

export const selectAllNotifications = (state: NotificationStore) =>
  Object.values(state.notifications).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
