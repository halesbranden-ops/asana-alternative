import React from 'react';
import { Priority } from '../../types';
import { getPriorityColor, getPriorityLabel } from '../../utils/task.utils';
import { Tooltip } from '../ui/Tooltip';

interface PriorityIconProps {
  priority: Priority;
  size?: number;
  showTooltip?: boolean;
}

export const PriorityIcon: React.FC<PriorityIconProps> = ({ priority, size = 14, showTooltip = true }) => {
  const color = getPriorityColor(priority);

  const icons: Record<Priority, React.ReactNode> = {
    urgent: (
      <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
        <path d="M7 2v6M7 10v1.5" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <circle cx="7" cy="12.5" r="0.5" fill={color} />
      </svg>
    ),
    high: (
      <svg width={size} height={size} viewBox="0 0 14 14" fill={color}>
        <path d="M7 2L10 7H4L7 2ZM4 8H10V10H4V8Z" />
      </svg>
    ),
    medium: (
      <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
        <path d="M3 5h8M3 9h8" stroke={color} strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    low: (
      <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
        <path d="M7 12L4 7H10L7 12ZM4 4H10V6H4V4Z" fill={color} />
      </svg>
    ),
    none: (
      <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="4" stroke={color} strokeWidth="1.5" strokeDasharray="2 2" />
      </svg>
    ),
  };

  const icon = icons[priority] || icons.none;

  if (showTooltip) {
    return <Tooltip content={`Priority: ${getPriorityLabel(priority)}`}><span className="flex items-center">{icon}</span></Tooltip>;
  }

  return <span className="flex items-center">{icon}</span>;
};
