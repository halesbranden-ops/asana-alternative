import React from 'react';
import { cn } from '../../utils/cn';
import { Avatar } from './Avatar';
import { User } from '../../types';

interface AvatarGroupProps {
  users: (User | undefined)[];
  max?: number;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({ users, max = 4, size = 'sm', className }) => {
  const validUsers = users.filter(Boolean) as User[];
  const visible = validUsers.slice(0, max);
  const overflow = validUsers.length - max;

  return (
    <div className={cn('flex items-center', className)}>
      {visible.map((user, index) => (
        <div
          key={user.id}
          className="ring-2 ring-white dark:ring-[#2A2A2A] rounded-full"
          style={{ marginLeft: index === 0 ? 0 : -6, zIndex: visible.length - index }}
        >
          <Avatar user={user} size={size} />
        </div>
      ))}
      {overflow > 0 && (
        <div
          className={cn(
            'rounded-full bg-[#EBEBEB] dark:bg-[#2E2E2E] ring-2 ring-white dark:ring-[#2A2A2A] flex items-center justify-center text-[#555555] dark:text-[#A0A0A0] font-medium -ml-1.5',
            size === 'xs' ? 'w-5 h-5 text-[9px]' : size === 'sm' ? 'w-7 h-7 text-xs' : 'w-8 h-8 text-sm'
          )}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
};
