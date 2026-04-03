import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TaskDetailPanel } from '../task/TaskDetailPanel';
import { TaskCreateModal } from '../task/TaskCreateModal';
import { GlobalSearchModal } from '../search/GlobalSearchModal';
import { ToastContainer } from '../ui/ToastContainer';
import { ProjectCreateModal } from '../project/ProjectCreateModal';
import { ProjectEditModal } from '../project/ProjectEditModal';
import { useUIStore } from '../../store/uiStore';

export const AppShell: React.FC = () => {
  const { isMobileSidebarOpen, closeMobileSidebar } = useUIStore();
  const location = useLocation();

  return (
    <div className="flex h-screen overflow-hidden bg-[#F0EFEC] dark:bg-[#242424]">
      {/* Sidebar — hidden on mobile, shown inline on md+ */}
      <div className="hidden md:block flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50 animate-backdrop-in" onClick={closeMobileSidebar} />
          <Sidebar isMobileOverlay onMobileClose={closeMobileSidebar} />
        </div>
      )}

      {/* Main content — re-keyed on route change to trigger page-enter animation */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        <div key={location.pathname} className="flex-1 flex flex-col overflow-hidden animate-page-enter">
          <Outlet />
        </div>
      </main>

      {/* Global portals */}
      <TaskDetailPanel />
      <TaskCreateModal />
      <GlobalSearchModal />
      <ProjectCreateModal />
      <ProjectEditModal />
      <ToastContainer />
    </div>
  );
};
