import React from 'react';
import { cn } from '../../utils/cn';

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}

export const GradientText: React.FC<GradientTextProps> = ({ children, className, as: Tag = 'span' }) => {
  return (
    <Tag className={cn('text-[#111111] dark:text-white', className)}>
      {children}
    </Tag>
  );
};
