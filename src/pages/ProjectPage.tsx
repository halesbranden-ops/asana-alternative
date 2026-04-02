import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjectStore, selectProject } from '../store/projectStore';
import { useTaskStore } from '../store/taskStore';
import { useUIStore } from '../store/uiStore';
import { ProjectHeader } from '../components/project/ProjectHeader';
import { TaskFilters } from '../components/task/TaskFilters';
import { ListView } from '../components/views/ListView/ListView';
import { BoardView } from '../components/views/BoardView/BoardView';
import { CalendarView } from '../components/views/CalendarView/CalendarView';
import { TimelineView } from '../components/views/TimelineView/TimelineView';
import { ProjectOverviewPage } from './ProjectOverviewPage';
import { Button } from '../components/ui/Button';
import { cn } from '../utils/cn';

type ViewType = 'list' | 'board' | 'calendar' | 'timeline' | 'overview';

const ViewTab: React.FC<{ id: ViewType; label: string; icon: React.ReactNode; active: boolean; onClick: () => void }> = ({
  id, label, icon, active, onClick
}) => (
  <button
    onClick={onClick}
    className={cn(
      'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
      active
        ? 'bg-black/[0.08] dark:bg-white/10 text-[#111111] dark:text-white'
        : 'text-[#555555] dark:text-[#A0A0A0] hover:text-[#111111] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
    )}
  >
    {icon}
    {label}
  </button>
);

export const ProjectPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const project = useProjectStore(selectProject(projectId || ''));
  const [activeView, setActiveView] = useState<ViewType>('list');
  const { openTaskCreate, openStatusUpdate } = useUIStore() as any;
  const filters = useTaskStore((s) => s.filters);
  const sortBy = useTaskStore((s) => s.sortBy);

  if (!project) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-[#999999] dark:text-[#6B6B6B]">Project not found</p>
      </div>
    );
  }

  const views: { id: ViewType; label: string; icon: React.ReactNode }[] = [
    {
      id: 'list', label: 'List', icon: (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 3h10M2 7h10M2 11h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
      )
    },
    {
      id: 'board', label: 'Board', icon: (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="4" height="12" rx="1" stroke="currentColor" strokeWidth="1.3" /><rect x="6" y="1" width="4" height="8" rx="1" stroke="currentColor" strokeWidth="1.3" /><rect x="11" y="1" width="2" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.3" /></svg>
      )
    },
    {
      id: 'calendar', label: 'Calendar', icon: (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="2" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.3" /><path d="M1 5h12M4.5 1v2M9.5 1v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>
      )
    },
    {
      id: 'timeline', label: 'Timeline', icon: (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M2 4h6M2 10h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
      )
    },
    {
      id: 'overview', label: 'Overview', icon: (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3" /><path d="M7 7V3M7 7l3 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>
      )
    },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Project header */}
      <ProjectHeader project={project} />

      {/* View tabs and actions */}
      <div className="flex items-center justify-between px-6 py-2 border-b border-[#E0E0E0] dark:border-white/10 flex-shrink-0 bg-white dark:bg-[#2A2A2A]">
        <div className="flex items-center gap-1">
          {views.map((view) => (
            <ViewTab
              key={view.id}
              id={view.id}
              label={view.label}
              icon={view.icon}
              active={activeView === view.id}
              onClick={() => setActiveView(view.id)}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          {activeView !== 'overview' && activeView !== 'calendar' && activeView !== 'timeline' && (
            <TaskFilters />
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openStatusUpdate && openStatusUpdate(project.id)}
          >
            Update Status
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => openTaskCreate(project.id)}
            leftIcon={<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>}
          >
            Add Task
          </Button>
        </div>
      </div>

      {/* View content */}
      <div className="flex-1 overflow-hidden">
        {activeView === 'list' && <ListView projectId={project.id} filters={filters} sortBy={sortBy} />}
        {activeView === 'board' && <BoardView projectId={project.id} filters={filters} />}
        {activeView === 'calendar' && <CalendarView projectId={project.id} />}
        {activeView === 'timeline' && <TimelineView projectId={project.id} />}
        {activeView === 'overview' && <ProjectOverviewPage project={project} />}
      </div>
    </div>
  );
};
