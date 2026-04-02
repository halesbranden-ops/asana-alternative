import React from 'react';
import { cn } from '../../utils/cn';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
  size?: 'sm' | 'md';
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, className, size = 'md' }) => {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'flex items-center gap-1.5 rounded-lg font-medium transition-all duration-150',
            size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm',
            activeTab === tab.id
              ? 'bg-black/[0.08] dark:bg-white/10 text-[#111111] dark:text-white'
              : 'text-[#555555] dark:text-[#A0A0A0] hover:text-[#111111] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
          )}
        >
          {tab.icon}
          {tab.label}
          {tab.count !== undefined && (
            <span className={cn(
              'rounded-full px-1.5 py-0.5 text-xs font-semibold',
              activeTab === tab.id
                ? 'bg-[#44AADF]/20 text-[#44AADF]'
                : 'bg-black/5 dark:bg-white/10 text-[#555555] dark:text-[#A0A0A0]'
            )}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};
