import React from 'react';
import { cn } from '../../utils/cn';
import { Input } from './Input';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  wrapperClassName?: string;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, wrapperClassName, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        type="search"
        wrapperClassName={wrapperClassName}
        leftIcon={
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="6" cy="6" r="4.5" />
            <path d="M9.5 9.5L13 13" strokeLinecap="round" />
          </svg>
        }
        className={cn('pl-9', className)}
        {...props}
      />
    );
  }
);

SearchInput.displayName = 'SearchInput';
