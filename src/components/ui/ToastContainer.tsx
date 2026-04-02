import React from 'react';
import { createPortal } from 'react-dom';
import { useUIStore } from '../../store/uiStore';
import { cn } from '../../utils/cn';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useUIStore();

  if (toasts.length === 0) return null;

  return createPortal(
    <div className="fixed bottom-6 right-6 z-[70] flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'flex items-center gap-3 px-4 py-3 rounded-xl shadow-panel border animate-scale-in min-w-[280px] max-w-[400px]',
            toast.type === 'success' && 'bg-green-50 dark:bg-green-500/20 border-green-200 dark:border-green-500/30 text-green-700 dark:text-green-300',
            toast.type === 'error' && 'bg-red-50 dark:bg-red-500/20 border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-300',
            toast.type === 'info' && 'bg-[#44AADF]/10 dark:bg-[#44AADF]/20 border-[#44AADF]/30 text-[#44AADF]',
            toast.type === 'warning' && 'bg-yellow-50 dark:bg-yellow-500/20 border-yellow-200 dark:border-yellow-500/30 text-yellow-700 dark:text-yellow-300'
          )}
        >
          <span className="text-sm flex-1">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-current opacity-60 hover:opacity-100 transition-opacity"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M10.5 3.5l-7 7M3.5 3.5l7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      ))}
    </div>,
    document.body
  );
};
