import React, { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { TopBar } from '../components/layout/TopBar';
import { useNotificationStore, selectUnreadCount } from '../store/notificationStore';
import { InboxItem } from '../components/inbox/InboxItem';
import { Button } from '../components/ui/Button';
import { Tabs } from '../components/ui/Tabs';

type FilterTab = 'all' | 'unread' | 'assigned';

export const InboxPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const notifications = useNotificationStore(useShallow((s) =>
    Object.values(s.notifications).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  ));
  const unreadCount = useNotificationStore(selectUnreadCount);
  const { markAllAsRead } = useNotificationStore();

  const filtered = notifications.filter((n) => {
    if (activeFilter === 'unread') return !n.isRead;
    if (activeFilter === 'assigned') return n.type === 'task_assigned';
    return true;
  });

  const tabs = [
    { id: 'all', label: 'All', count: notifications.length },
    { id: 'unread', label: 'Unread', count: unreadCount },
    { id: 'assigned', label: 'Assigned to me', count: notifications.filter((n) => n.type === 'task_assigned').length },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar
        title="Inbox"
        subtitle={unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
        actions={
          unreadCount > 0 ? (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              Mark all read
            </Button>
          ) : undefined
        }
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Filter tabs */}
        <div className="px-5 py-3 border-b border-[#E0E0E0] dark:border-white/10 flex-shrink-0">
          <Tabs
            tabs={tabs}
            activeTab={activeFilter}
            onChange={(id) => setActiveFilter(id as FilterTab)}
          />
        </div>

        {/* Notification list */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-[#999999] dark:text-[#6B6B6B]">
              <div className="text-4xl mb-3">📬</div>
              <p className="text-sm">No notifications to show</p>
            </div>
          ) : (
            filtered.map((notification) => (
              <InboxItem key={notification.id} notification={notification} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};
