import React from 'react';
import { Notification } from '../../types';
import { useUserStore } from '../../store/userStore';
import { useNotificationStore } from '../../store/notificationStore';
import { Avatar } from '../ui/Avatar';
import { timeAgo } from '../../utils/date.utils';
import { cn } from '../../utils/cn';

const typeIcons: Record<string, { icon: string; color: string }> = {
  task_assigned: { icon: '→', color: 'text-[#44AADF]' },
  task_completed: { icon: '✓', color: 'text-green-500 dark:text-green-400' },
  task_commented: { icon: '💬', color: 'text-violet-500' },
  task_due_soon: { icon: '⏰', color: 'text-yellow-600 dark:text-yellow-400' },
  task_overdue: { icon: '!', color: 'text-red-500 dark:text-red-400' },
  project_status_update: { icon: '📊', color: 'text-[#44AADF]' },
  mention: { icon: '@', color: 'text-orange-500' },
  task_added_to_project: { icon: '+', color: 'text-green-500 dark:text-green-400' },
  member_added: { icon: '👋', color: 'text-green-500 dark:text-green-400' },
};

interface InboxItemProps {
  notification: Notification;
  onClick?: () => void;
}

export const InboxItem: React.FC<InboxItemProps> = ({ notification, onClick }) => {
  const actor = useUserStore((s) => s.users[notification.actorId]);
  const { markAsRead } = useNotificationStore();
  const typeInfo = typeIcons[notification.type] || { icon: '•', color: 'text-[#555555] dark:text-[#A0A0A0]' };

  const handleClick = () => {
    if (!notification.isRead) markAsRead(notification.id);
    onClick?.();
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        'flex items-start gap-3 px-5 py-4 border-b border-[#E0E0E0] dark:border-white/5 cursor-pointer transition-colors hover:bg-black/5 dark:hover:bg-white/5',
        !notification.isRead && 'bg-[#44AADF]/5'
      )}
    >
      {/* Unread dot */}
      <div className="flex-shrink-0 mt-1.5">
        {!notification.isRead ? (
          <div className="w-2 h-2 rounded-full bg-[#44AADF]" />
        ) : (
          <div className="w-2 h-2 rounded-full bg-transparent" />
        )}
      </div>

      {/* Actor avatar */}
      {actor && <Avatar user={actor} size="sm" className="flex-shrink-0 mt-0.5" />}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-[#333333] dark:text-[#D0D0D0] leading-relaxed">{notification.message}</p>
        <p className="text-xs text-[#999999] dark:text-[#6B6B6B] mt-0.5">{timeAgo(notification.createdAt)}</p>
      </div>

      {/* Type icon */}
      <span className={cn('flex-shrink-0 text-base mt-0.5', typeInfo.color)}>
        {typeInfo.icon}
      </span>
    </div>
  );
};
