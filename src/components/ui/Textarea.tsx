import React from 'react';
import { cn } from '../../utils/cn';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-[#555555] dark:text-[#A0A0A0]">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            'w-full bg-white dark:bg-[#333333] border border-[#E0E0E0] dark:border-white/10 rounded-lg px-3 py-2 text-sm text-[#111111] dark:text-white placeholder-[#999999] dark:placeholder-[#6B6B6B] resize-none',
            'focus:outline-none focus:ring-2 focus:ring-[#44AADF]/50 focus:border-[#44AADF]/50 transition-all duration-150',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-red-500/50',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
