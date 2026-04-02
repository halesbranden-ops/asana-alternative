import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TaskDetailPanel } from '../task/TaskDetailPanel';
import { TaskCreateModal } from '../task/TaskCreateModal';
import { GlobalSearchModal } from '../search/GlobalSearchModal';
import { ToastContainer } from '../ui/ToastContainer';
import { ProjectCreateModal } from '../project/ProjectCreateModal';
import { ProjectEditModal } from '../project/ProjectEditModal';

export const AppShell: React.FC = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-[#F0EFEC] dark:bg-[#242424]">
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <Outlet />
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
