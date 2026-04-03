import React from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { useUIStore } from '../../store/uiStore';
import { useNotificationStore, selectUnreadCount } from '../../store/notificationStore';
import { Button } from '../ui/Button';
import { Tooltip } from '../ui/Tooltip';
import { searchBarRef } from '../../utils/searchBarRef';

interface TopBarProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  viewTabs?: React.ReactNode;
  className?: string;
}

export const TopBar: React.FC<TopBarProps> = ({ title, subtitle, actions, viewTabs, className }) => {
  const { openSearch, openTaskCreate, theme, toggleTheme, isSearchOpen, openMobileSidebar } = useUIStore();
  const unreadCount = useNotificationStore(selectUnreadCount);
  const navigate = useNavigate();

  return (
    <header className={cn('flex items-center h-14 px-4 border-b border-[#E0E0E0] dark:border-white/10 bg-white dark:bg-[#2A2A2A] flex-shrink-0 gap-3', className)}>

      {/* Hamburger — mobile only */}
      <button
        onClick={openMobileSidebar}
        className="md:hidden p-2 -ml-1 rounded-lg text-[#555555] dark:text-[#A0A0A0] hover:text-[#111111] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors flex-shrink-0"
        aria-label="Open navigation"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <path d="M2 4h14M2 9h14M2 14h14" />
        </svg>
      </button>

      {/* Title area */}
      {(title || subtitle) && (
        <div className="min-w-0 flex-shrink-0">
          {subtitle && <p className="text-xs text-[#999999] dark:text-[#6B6B6B] leading-none mb-0.5">{subtitle}</p>}
          {title && <h1 className="text-base font-bold text-[#111111] dark:text-white truncate">{title}</h1>}
        </div>
      )}

      {/* View tabs */}
      {viewTabs && <div className="flex-shrink-0">{viewTabs}</div>}

      {/* ── Search bar (grows to fill space) ── */}
      <button
        ref={(el) => { searchBarRef.current = el; }}
        onClick={openSearch}
        className={cn(
          'flex items-center gap-2.5 min-w-0 rounded-xl px-3 py-2 cursor-text transition-all duration-150',
          'border',
          isSearchOpen
            ? 'bg-[#44AADF]/[0.07] dark:bg-[#44AADF]/[0.10] border-[#44AADF]/40'
            : 'bg-black/[0.04] dark:bg-white/[0.06] border-transparent hover:bg-black/[0.07] dark:hover:bg-white/[0.09] hover:border-[#D0D0D0] dark:hover:border-white/15',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#44AADF]/50',
          viewTabs ? 'flex-1' : 'flex-1 max-w-lg'
        )}
        aria-label="Open search"
      >
        {/* Magnifier icon */}
        <svg
          width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"
          className={cn('flex-shrink-0 transition-colors duration-150', isSearchOpen ? 'text-[#44AADF]' : 'text-[#AAAAAA] dark:text-[#666666]')}
        >
          <circle cx="7" cy="7" r="4.5" />
          <path d="M11 11l3 3" strokeLinecap="round" />
        </svg>

        {/* Placeholder text */}
        <span className="flex-1 text-sm text-[#AAAAAA] dark:text-[#666666] text-left truncate select-none">
          Search tasks, events, projects…
        </span>

        {/* ⌘K hint */}
        <span className="hidden sm:flex items-center gap-0.5 flex-shrink-0">
          <kbd className="text-[10px] font-mono text-[#CCCCCC] dark:text-[#555555] bg-black/5 dark:bg-white/5 px-1.5 py-0.5 rounded border border-[#E0E0E0] dark:border-white/10">
            ⌘K
          </kbd>
        </span>
      </button>

      {/* ── Right-side actions ── */}
      <div className="flex items-center gap-1.5 flex-shrink-0">

        {/* Notifications */}
        <Tooltip content="Inbox" position="bottom">
          <button
            onClick={() => navigate('/inbox')}
            className="relative p-2 rounded-lg text-[#555555] dark:text-[#A0A0A0] hover:text-[#111111] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 10l3-7h6l3 7v3a1 1 0 01-1 1H3a1 1 0 01-1-1v-3z" strokeLinejoin="round" />
              <path d="M2 10h4l1 2h2l1-2h4" strokeLinejoin="round" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#44AADF] rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </Tooltip>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="px-2.5 py-1 rounded-md text-xs font-medium border border-[#D8D6D2] dark:border-white/20 text-[#555555] dark:text-[#A0A0A0] hover:border-[#44AADF] hover:text-[#44AADF] transition-colors duration-150 hidden sm:block"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? '☀ Light' : '🌙 Dark'}
        </button>

        {/* Custom actions slot */}
        {actions}

        {/* New task button */}
        <Button
          variant="primary"
          size="sm"
          onClick={() => openTaskCreate()}
          leftIcon={
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          }
        >
          <span className="hidden sm:inline">New Task</span>
          <span className="sm:hidden">New</span>
        </Button>
      </div>
    </header>
  );
};
