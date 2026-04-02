import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TopBar } from '../components/layout/TopBar';
import { usePortfolioStore } from '../store/portfolioStore';
import { useProjectStore } from '../store/projectStore';
import { useTaskStore } from '../store/taskStore';
import { ProjectStatusBadge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { getTaskCompletionPercent } from '../utils/task.utils';
import { formatDate } from '../utils/date.utils';

export const PortfolioDetailPage: React.FC = () => {
  const { portfolioId } = useParams();
  const portfolio = usePortfolioStore((s) => s.portfolios[portfolioId || '']);
  const projects = useProjectStore((s) => s.projects);
  const allTasks = useTaskStore((s) => s.tasks);
  const navigate = useNavigate();

  if (!portfolio) {
    return <div className="flex items-center justify-center h-full text-[#999999] dark:text-[#6B6B6B]">Portfolio not found</div>;
  }

  const portfolioProjects = portfolio.projectIds.map((id) => projects[id]).filter(Boolean);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar title={portfolio.name} subtitle="Portfolio" />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <p className="text-[#555555] dark:text-[#A0A0A0] text-sm mb-6">{portfolio.description}</p>

          <div className="bg-white dark:bg-[#2E2E2E] rounded-xl border border-[#E0E0E0] dark:border-white/10 overflow-hidden">
            <div className="px-5 py-3 border-b border-[#E0E0E0] dark:border-white/10">
              <div className="grid grid-cols-12 text-xs font-medium text-[#555555] dark:text-[#A0A0A0] uppercase tracking-wider gap-4">
                <div className="col-span-4">Project</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Progress</div>
                <div className="col-span-2">Due date</div>
                <div className="col-span-2">Tasks</div>
              </div>
            </div>

            {portfolioProjects.map((project) => {
              const pTasks = Object.values(allTasks).filter((t) => t.projectId === project.id && !t.isArchived);
              const pct = getTaskCompletionPercent(pTasks);
              const done = pTasks.filter((t) => t.status === 'done').length;

              return (
                <div
                  key={project.id}
                  onClick={() => navigate(`/projects/${project.id}`)}
                  className="px-5 py-4 border-b border-[#E0E0E0] dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors grid grid-cols-12 items-center gap-4"
                >
                  <div className="col-span-4 flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: project.color }} />
                    <span className="text-sm font-medium text-[#111111] dark:text-white truncate">{project.name}</span>
                  </div>
                  <div className="col-span-2">
                    <ProjectStatusBadge status={project.status} />
                  </div>
                  <div className="col-span-2">
                    <ProgressBar value={pct} height="h-1.5" color={project.color} showLabel />
                  </div>
                  <div className="col-span-2 text-xs text-[#555555] dark:text-[#A0A0A0]">
                    {formatDate(project.dueDate) || '—'}
                  </div>
                  <div className="col-span-2 text-xs text-[#555555] dark:text-[#A0A0A0]">
                    {done}/{pTasks.length} done
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
