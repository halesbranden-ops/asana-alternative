import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';
import { cn } from '../../utils/cn';
import { useProjectStore } from '../../store/projectStore';
import { useNotificationStore, selectUnreadCount } from '../../store/notificationStore';
import { useUIStore } from '../../store/uiStore';
import { useUserStore, selectCurrentUser } from '../../store/userStore';
import { Avatar } from '../ui/Avatar';
import { Tooltip } from '../ui/Tooltip';
import { useTaskStore } from '../../store/taskStore';

const BullFitLogo: React.FC<{ collapsed: boolean }> = ({ collapsed }) => (
  <div className="flex items-center gap-2.5">
    <div className="w-8 h-8 flex-shrink-0">
      <img src="/bullfit-logo.png" alt="BullFit" className="w-full h-full object-contain brightness-0 dark:invert" />
    </div>
    {!collapsed && (
      <div className="flex items-baseline gap-0.5">
        <span className="text-xl font-black text-[#111111] dark:text-white tracking-tight" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>BULL</span>
        <span className="text-xl font-light text-[#111111] dark:text-white tracking-tight" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>FIT</span>
      </div>
    )}
  </div>
);

const NavItem: React.FC<{
  to: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
  collapsed: boolean;
}> = ({ to, icon, label, badge, collapsed }) => {
  const item = (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 cursor-pointer',
          isActive
            ? 'bg-black/[0.08] dark:bg-white/10 text-[#111111] dark:text-white font-medium'
            : 'text-[#555555] dark:text-[#A0A0A0] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#111111] dark:hover:text-white',
          collapsed && 'justify-center'
        )
      }
    >
      <span className="flex-shrink-0">{icon}</span>
      {!collapsed && <span className="flex-1">{label}</span>}
      {!collapsed && badge !== undefined && badge > 0 && (
        <span className="bg-[#44AADF] text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </NavLink>
  );

  if (collapsed) {
    return <Tooltip content={label} position="right">{item}</Tooltip>;
  }
  return item;
};

export const Sidebar: React.FC = () => {
  const { sidebarCollapsed, toggleSidebar, openProjectCreate } = useUIStore();
  const projects = useProjectStore(useShallow((s) => Object.values(s.projects).filter((p) => !p.isArchived)));
  const unreadCount = useNotificationStore(selectUnreadCount);
  const currentUser = useUserStore(selectCurrentUser);
  const tasks = useTaskStore((s) => s.tasks);
  const navigate = useNavigate();
  const [projectsExpanded, setProjectsExpanded] = useState(true);

  const myTaskCount = currentUser
    ? Object.values(tasks).filter(
        (t) => t.assigneeId === currentUser.id && t.status !== 'done' && !t.isArchived
      ).length
    : 0;

  const collapsed = sidebarCollapsed;

  return (
    <aside
      className={cn(
        'h-full flex flex-col bg-white dark:bg-[#1C1C1C] border-r border-[#E0E0E0] dark:border-white/5 transition-all duration-300 flex-shrink-0',
        collapsed ? 'w-[60px]' : 'w-[260px]'
      )}
    >
      {/* Logo */}
      <div className={cn('flex items-center h-14 px-4 border-b border-[#E0E0E0] dark:border-white/5', collapsed && 'justify-center px-0')}>
        <BullFitLogo collapsed={collapsed} />
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-0.5 no-scrollbar">
        {/* Main nav */}
        <NavItem to="/" icon={<HomeIcon />} label="Home" collapsed={collapsed} />
        <NavItem to="/my-tasks" icon={<TasksIcon />} label="My Tasks" badge={myTaskCount} collapsed={collapsed} />
        <NavItem to="/inbox" icon={<InboxIcon />} label="Inbox" badge={unreadCount} collapsed={collapsed} />
        <NavItem to="/calendar" icon={<CalendarIcon />} label="Calendar" collapsed={collapsed} />

        {!collapsed && (
          <>
            {/* Divider */}
            <div className="my-2 border-t border-[#E0E0E0] dark:border-white/5" />

            {/* Projects section */}
            <div className="flex items-center justify-between px-3 py-1">
              <button
                onClick={() => setProjectsExpanded(!projectsExpanded)}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#999999] dark:text-[#6B6B6B] hover:text-[#555555] dark:hover:text-[#A0A0A0] uppercase tracking-wider transition-colors"
              >
                <svg
                  width="10" height="10" viewBox="0 0 10 10" fill="currentColor"
                  className={cn('transition-transform', projectsExpanded ? 'rotate-90' : '')}
                >
                  <path d="M2 2l4 3-4 3V2z" />
                </svg>
                Projects
              </button>
              <button
                onClick={openProjectCreate}
                className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-[#999999] dark:text-[#6B6B6B] hover:text-[#111111] dark:hover:text-white transition-colors"
                title="New project"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {projectsExpanded && (
              <div className="space-y-0.5">
                {projects.map((project) => (
                  <NavLink
                    key={project.id}
                    to={`/projects/${project.id}`}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm transition-all cursor-pointer group',
                        isActive
                          ? 'bg-black/[0.08] dark:bg-white/10 text-[#111111] dark:text-white'
                          : 'text-[#555555] dark:text-[#A0A0A0] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#111111] dark:hover:text-white'
                      )
                    }
                  >
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: project.color }}
                    />
                    <span className="truncate flex-1">{project.name}</span>
                  </NavLink>
                ))}
              </div>
            )}

            <div className="my-2 border-t border-[#E0E0E0] dark:border-white/5" />

            {/* Portfolios */}
            <NavItem to="/portfolios" icon={<PortfolioIcon />} label="Portfolios" collapsed={collapsed} />

            {/* Goals */}
            <NavItem to="/goals" icon={<GoalsIcon />} label="Goals" collapsed={collapsed} />

            {/* Teams */}
            <NavItem to="/teams" icon={<TeamsIcon />} label="Teams" collapsed={collapsed} />

            <div className="my-2 border-t border-[#E0E0E0] dark:border-white/5" />

            {/* Settings */}
            <NavItem to="/settings" icon={<SettingsIcon />} label="Settings" collapsed={collapsed} />
          </>
        )}

        {collapsed && (
          <>
            <div className="my-2 border-t border-[#E0E0E0] dark:border-white/5" />
            <Tooltip content="Portfolios" position="right">
              <NavLink to="/portfolios" className={({ isActive }) => cn('flex items-center justify-center px-3 py-2 rounded-lg text-sm transition-all', isActive ? 'bg-black/[0.08] dark:bg-white/10 text-[#111111] dark:text-white' : 'text-[#555555] dark:text-[#A0A0A0] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#111111] dark:hover:text-white')}>
                <PortfolioIcon />
              </NavLink>
            </Tooltip>
            <Tooltip content="Goals" position="right">
              <NavLink to="/goals" className={({ isActive }) => cn('flex items-center justify-center px-3 py-2 rounded-lg text-sm transition-all', isActive ? 'bg-black/[0.08] dark:bg-white/10 text-[#111111] dark:text-white' : 'text-[#555555] dark:text-[#A0A0A0] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#111111] dark:hover:text-white')}>
                <GoalsIcon />
              </NavLink>
            </Tooltip>
            <Tooltip content="Teams" position="right">
              <NavLink to="/teams" className={({ isActive }) => cn('flex items-center justify-center px-3 py-2 rounded-lg text-sm transition-all', isActive ? 'bg-black/[0.08] dark:bg-white/10 text-[#111111] dark:text-white' : 'text-[#555555] dark:text-[#A0A0A0] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#111111] dark:hover:text-white')}>
                <TeamsIcon />
              </NavLink>
            </Tooltip>
          </>
        )}
      </div>

      {/* Bottom user area */}
      <div className={cn('border-t border-[#E0E0E0] dark:border-white/5 p-3 flex items-center justify-between gap-2', collapsed && 'justify-center')}>
        {currentUser && (
          <>
            <button
              onClick={() => navigate('/settings')}
              className="flex items-center gap-2.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 p-1.5 transition-colors flex-1 min-w-0"
            >
              <Avatar user={currentUser} size="sm" />
              {!collapsed && (
                <div className="min-w-0 text-left">
                  <p className="text-sm font-medium text-[#111111] dark:text-white truncate">{currentUser.name}</p>
                  <p className="text-xs text-[#999999] dark:text-[#6B6B6B] truncate">{currentUser.role}</p>
                </div>
              )}
            </button>
            <Tooltip content={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} position={collapsed ? 'right' : 'top'}>
              <button
                onClick={toggleSidebar}
                className="p-1.5 rounded-lg text-[#999999] dark:text-[#6B6B6B] hover:text-[#111111] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors flex-shrink-0"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={cn('transition-transform', collapsed && 'rotate-180')}>
                  <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </Tooltip>
          </>
        )}
      </div>
    </aside>
  );
};

// Icon components
const HomeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M2 7l6-5 6 5v7a1 1 0 01-1 1H9v-4H7v4H3a1 1 0 01-1-1V7z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);

const TasksIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const InboxIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M2 10l3-7h6l3 7v3a1 1 0 01-1 1H3a1 1 0 01-1-1v-3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M2 10h4l1 2h2l1-2h4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);

const PortfolioIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="2" y="5" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M5 5V3.5A1.5 1.5 0 016.5 2h3A1.5 1.5 0 0111 3.5V5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M2 9h12" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const GoalsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="8" cy="8" r="1" fill="currentColor" />
  </svg>
);

const TeamsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="6" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="11" cy="5" r="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M1 13c0-2.5 2.2-4 5-4s5 1.5 5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M11 9c1.5 0 3 .8 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="1.5" y="2.5" width="13" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M5 1.5v2M11 1.5v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M1.5 6.5h13" stroke="currentColor" strokeWidth="1.5" />
    <rect x="4" y="9" width="2" height="2" rx="0.5" fill="currentColor" />
    <rect x="7" y="9" width="2" height="2" rx="0.5" fill="currentColor" />
    <rect x="10" y="9" width="2" height="2" rx="0.5" fill="currentColor" />
  </svg>
);
