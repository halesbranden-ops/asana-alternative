import React from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useProjectStore } from '../../store/projectStore';
import { useTaskStore } from '../../store/taskStore';
import { ProjectStatusBadge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { useNavigate } from 'react-router-dom';
import { getTaskCompletionPercent } from '../../utils/task.utils';

export const ProjectStatusSummary: React.FC = () => {
  const projects = useProjectStore(useShallow((s) => Object.values(s.projects).filter((p) => !p.isArchived)));
  const allTasks = useTaskStore((s) => s.tasks);
  const navigate = useNavigate();

  return (
    <div className="bg-white dark:bg-[#2E2E2E] rounded-xl p-4 border border-[#E0E0E0] dark:border-white/10 card-lift animate-fade-slide-up">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[#111111] dark:text-white">Project Health</h3>
        <span className="text-xs text-[#999999] dark:text-[#6B6B6B]">{projects.length} projects</span>
      </div>
      <div className="space-y-3">
        {projects.slice(0, 5).map((project) => {
          const projectTasks = Object.values(allTasks).filter((t) => t.projectId === project.id && !t.isArchived);
          const pct = getTaskCompletionPercent(projectTasks);
          return (
            <div
              key={project.id}
              className="cursor-pointer group"
              onClick={() => navigate(`/projects/${project.id}`)}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: project.color }} />
                  <span className="text-xs font-medium text-[#111111] dark:text-white group-hover:text-[#44AADF] transition-colors truncate max-w-[120px]">{project.name}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-[#999999] dark:text-[#6B6B6B]">{pct}%</span>
                  <ProjectStatusBadge status={project.status} />
                </div>
              </div>
              <ProgressBar value={pct} height="h-1" color={project.color} />
            </div>
          );
        })}
      </div>
    </div>
  );
};
