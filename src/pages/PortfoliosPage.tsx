import React from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '../components/layout/TopBar';
import { usePortfolioStore } from '../store/portfolioStore';
import { useProjectStore } from '../store/projectStore';
import { useTaskStore } from '../store/taskStore';
import { ProgressBar } from '../components/ui/ProgressBar';
import { ProjectStatusBadge } from '../components/ui/Badge';
import { getTaskCompletionPercent, getProjectStatusLabel } from '../utils/task.utils';

export const PortfoliosPage: React.FC = () => {
  const portfolios = usePortfolioStore(useShallow((s) => Object.values(s.portfolios)));
  const projects = useProjectStore((s) => s.projects);
  const allTasks = useTaskStore((s) => s.tasks);
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar title="Portfolios" subtitle={`${portfolios.length} portfolios`} />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {portfolios.map((portfolio) => {
              const portfolioProjects = portfolio.projectIds.map((id) => projects[id]).filter(Boolean);
              const allPortfolioTasks = portfolioProjects.flatMap((p) =>
                Object.values(allTasks).filter((t) => t.projectId === p.id && !t.isArchived)
              );
              const overallPct = getTaskCompletionPercent(allPortfolioTasks);

              return (
                <div
                  key={portfolio.id}
                  onClick={() => navigate(`/portfolios/${portfolio.id}`)}
                  className="bg-white dark:bg-[#2E2E2E] border border-[#E0E0E0] dark:border-white/10 rounded-xl overflow-hidden cursor-pointer hover:border-[#D0D0D0] dark:hover:border-white/20 transition-all group"
                >
                  {/* Header */}
                  <div className="h-2" style={{ backgroundColor: portfolio.color }} />
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-base font-bold text-[#111111] dark:text-white group-hover:text-[#44AADF] transition-colors">{portfolio.name}</h3>
                        <p className="text-xs text-[#555555] dark:text-[#A0A0A0] mt-0.5">{portfolio.description}</p>
                      </div>
                      <span className="text-xs text-[#555555] dark:text-[#A0A0A0] bg-black/5 dark:bg-white/5 px-2 py-1 rounded flex-shrink-0">
                        {portfolioProjects.length} projects
                      </span>
                    </div>

                    {/* Progress */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-[#555555] dark:text-[#A0A0A0]">Progress</span>
                        <span className="text-xs font-semibold text-[#111111] dark:text-white">{overallPct}%</span>
                      </div>
                      <ProgressBar value={overallPct} height="h-2" color={portfolio.color} />
                    </div>

                    {/* Projects list */}
                    <div className="space-y-2">
                      {portfolioProjects.slice(0, 3).map((project) => {
                        const pTasks = Object.values(allTasks).filter((t) => t.projectId === project.id && !t.isArchived);
                        const pct = getTaskCompletionPercent(pTasks);
                        return (
                          <div key={project.id} className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: project.color }} />
                            <span className="text-xs text-[#333333] dark:text-[#D0D0D0] flex-1 truncate">{project.name}</span>
                            <ProjectStatusBadge status={project.status} />
                            <span className="text-xs text-[#555555] dark:text-[#A0A0A0]">{pct}%</span>
                          </div>
                        );
                      })}
                      {portfolioProjects.length > 3 && (
                        <p className="text-xs text-[#999999] dark:text-[#6B6B6B]">+{portfolioProjects.length - 3} more</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {portfolios.length === 0 && (
            <div className="text-center py-16 text-[#999999] dark:text-[#6B6B6B]">
              <p className="text-sm">No portfolios yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
