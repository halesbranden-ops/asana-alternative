import React from 'react';
import { cn } from '../../utils/cn';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description, action, className, icon }) => {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-6 text-center', className)}>
      <div className="w-16 h-16 mb-4 opacity-30">
        {icon || (
          <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 20 C8 20, 12 10, 20 12 L22 8 L26 14 C28 12, 32 10, 36 10 C40 10, 44 12, 46 14 L50 8 L52 12 C60 10, 56 20, 56 20 C60 28, 56 38, 48 44 L40 48 L36 56 L28 56 L24 48 L16 44 C8 38, 4 28, 8 20Z" fill="#44AADF" />
            <circle cx="24" cy="28" r="3" fill="white" />
            <circle cx="40" cy="28" r="3" fill="white" />
            <path d="M28 38 C28 38, 30 40, 32 40 C34 40, 36 38, 36 38" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
          </svg>
        )}
      </div>
      <h3 className="text-lg font-semibold text-[#555555] dark:text-[#A0A0A0] mb-1">{title}</h3>
      {description && <p className="text-sm text-[#999999] dark:text-[#6B6B6B] mb-4 max-w-xs">{description}</p>}
      {action}
    </div>
  );
};
