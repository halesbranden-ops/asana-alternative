import React from 'react';
import { cn } from '../../utils/cn';
import { User } from '../../types';
import { getAvatarColor, getUserInitials } from '../../utils/task.utils';

interface AvatarProps {
  user?: User | null;
  userId?: string;
  userName?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
}

const sizeMap = {
  xs: 'w-5 h-5 text-[9px]',
  sm: 'w-7 h-7 text-xs',
  md: 'w-8 h-8 text-sm',
  lg: 'w-10 h-10 text-base',
  xl: 'w-14 h-14 text-xl',
};

export const Avatar: React.FC<AvatarProps> = ({ user, userId, userName, size = 'md', className, onClick }) => {
  const id = user?.id || userId || 'default';
  const name = user?.name || userName || '?';
  const initials = getUserInitials(name);
  const color = getAvatarColor(id);

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0 select-none',
        sizeMap[size],
        onClick && 'cursor-pointer hover:opacity-80 transition-opacity',
        className
      )}
      style={{ backgroundColor: color }}
      onClick={onClick}
      title={name}
    >
      {initials}
    </div>
  );
};
