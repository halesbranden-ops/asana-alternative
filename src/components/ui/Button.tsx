import React from 'react';
import { cn } from '../../utils/cn';
import { Spinner } from './Spinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'secondary', size = 'md', isLoading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#44AADF]/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100';

    const variants = {
      primary:   'bg-[#44AADF] text-white hover:bg-[#3399CE] hover:-translate-y-0.5 hover:shadow-glow-blue active:translate-y-0 active:shadow-none',
      secondary: 'bg-white dark:bg-[#2E2E2E] border border-[#E0E0E0] dark:border-white/10 text-[#111111] dark:text-white hover:bg-[#F0EFEC] dark:hover:bg-white/10 hover:-translate-y-px hover:shadow-card active:translate-y-0',
      ghost:     'text-[#555555] dark:text-[#A0A0A0] hover:text-[#111111] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 hover:-translate-y-px active:translate-y-0 active:scale-95',
      danger:    'bg-red-500/10 dark:bg-red-500/20 border border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/20 dark:hover:bg-red-500/30 hover:-translate-y-px active:translate-y-0',
      outline:   'border border-[#44AADF]/60 text-[#44AADF] hover:bg-[#44AADF]/10 hover:-translate-y-px hover:shadow-glow-blue active:translate-y-0',
    };

    const sizes = {
      sm: 'text-xs px-2.5 py-1.5',
      md: 'text-sm px-4 py-2',
      lg: 'text-base px-6 py-3',
      icon: 'p-2',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? <Spinner size="sm" /> : leftIcon}
        {children}
        {rightIcon && !isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
