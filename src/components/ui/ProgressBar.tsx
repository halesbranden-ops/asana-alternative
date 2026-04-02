import React from 'react';
import { cn } from '../../utils/cn';

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  height?: string;
  showLabel?: boolean;
  color?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  className,
  height = 'h-2',
  showLabel = false,
  color,
}) => {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className={cn('flex-1 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden', height)}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${percent}%`,
            backgroundColor: color || '#44AADF',
          }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-[#555555] dark:text-[#A0A0A0] w-8 text-right">{Math.round(percent)}%</span>
      )}
    </div>
  );
};
