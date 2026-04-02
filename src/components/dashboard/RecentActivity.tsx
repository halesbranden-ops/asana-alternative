import React from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useNotificationStore } from '../../store/notificationStore';
import { useUserStore } from '../../store/userStore';
import { Avatar } from '../ui/Avatar';
import { timeAgo } from '../../utils/date.utils';
import { cn } from '../../utils/cn';

const notifIcons: Record<string, React.ReactNode> = {
  task_assigned: <span className="text-[#44AADF]">→</span>,
  task_completed: <span className="text-green-500">✓</span>,
  task_commented: <span className="text-violet-500">💬</span>,
  task_due_soon: <span className="text-yellow-500">⏰</span>,
  task_overdue: <span className="text-red-500">!</span>,
  project_status_update: <span className="text-[#44AADF]">📊</span>,
  mention: <span className="text-orange-500">@</span>,
  member_added: <span className="text-green-500">+</span>,
};

export const RecentActivity: React.FC = () => {
  const notifications = useNotificationStore(useShallow((s) =>
    Object.values(s.notifications).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  ));
  const users = useUserStore((s) => s.users);

  const recent = notifications.slice(0, 8);

  return (
    <div className="bg-white dark:bg-[#2E2E2E] rounded-xl p-4 border border-[#E0E0E0] dark:border-white/10 card-lift animate-fade-slide-up">
      <h3 className="text-sm font-semibold text-[#111111] dark:text-white mb-3">Recent Activity</h3>
      <div className="space-y-3">
        {recent.map((notif) => {
          const actor = users[notif.actorId];
          return (
            <div key={notif.id} className={cn('flex items-start gap-3', notif.isRead && 'opacity-60')}>
              {actor && <Avatar user={actor} size="xs" className="flex-shrink-0 mt-0.5" />}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[#333333] dark:text-[#D0D0D0] leading-relaxed">{notif.message}</p>
                <p className="text-[10px] text-[#999999] dark:text-[#6B6B6B] mt-0.5">{timeAgo(notif.createdAt)}</p>
              </div>
              <span className="flex-shrink-0 text-sm">
                {notifIcons[notif.type]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
