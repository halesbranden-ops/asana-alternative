import React from 'react';
import { cn } from '../../utils/cn';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className }) => {
  const sizes = {
    sm: 'w-3.5 h-3.5 border-[1.5px]',
    md: 'w-5 h-5 border-2',
    lg: 'w-8 h-8 border-2',
  };

  return (
    <div
      className={cn(
        'rounded-full border-black/10 dark:border-white/20 border-t-[#44AADF] animate-spin',
        sizes[size],
        className
      )}
    />
  );
};
