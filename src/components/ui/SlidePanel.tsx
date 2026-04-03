import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../utils/cn';

interface SlidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  width?: string;
  className?: string;
}

export const SlidePanel: React.FC<SlidePanelProps> = ({
  isOpen,
  onClose,
  children,
  width = '480px',
  className,
}) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return createPortal(
    <>
      {/* Backdrop overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[49] bg-black/10 dark:bg-black/20"
          onClick={onClose}
        />
      )}
      {/* Panel */}
      <div
        className={cn(
          'fixed top-0 right-0 h-full z-[50] bg-white dark:bg-[#2A2A2A] border-l border-[#E0E0E0] dark:border-white/10 shadow-panel flex flex-col',
          'transition-transform duration-300 ease-out',
          isOpen ? 'translate-x-0' : 'translate-x-full',
          className
        )}
        style={{ width: `min(100vw, ${width})` }}
      >
        {children}
      </div>
    </>,
    document.body
  );
};
