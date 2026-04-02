import React from 'react';
import { cn } from '../../utils/cn';

interface CheckboxProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md';
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked = false,
  onChange,
  disabled = false,
  className,
  size = 'md',
}) => {
  const sizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
  };

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onChange?.(!checked);
      }}
      className={cn(
        'rounded flex items-center justify-center border-2 flex-shrink-0 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#44AADF]/50 focus:ring-offset-1',
        sizes[size],
        checked
          ? 'border-[#44AADF] bg-[#44AADF]'
          : 'border-[#D0D0D0] dark:border-white/30 bg-transparent hover:border-[#44AADF]/60',
        disabled && 'opacity-50 cursor-not-allowed',
        !disabled && 'cursor-pointer',
        className
      )}
    >
      {checked && (
        <svg
          className={cn('text-white', size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5')}
          fill="none"
          viewBox="0 0 10 10"
        >
          <path d="M1.5 5L4 7.5L8.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
};
