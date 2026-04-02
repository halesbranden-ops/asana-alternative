import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TopBar } from '../components/layout/TopBar';
import { useGoalStore, selectGoal } from '../store/goalStore';
import { useProjectStore } from '../store/projectStore';
import { useUserStore } from '../store/userStore';
import { Avatar } from '../components/ui/Avatar';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Button } from '../components/ui/Button';
import { ProjectStatusBadge } from '../components/ui/Badge';

export const GoalDetailPage: React.FC = () => {
  const { goalId } = useParams();
  const goal = useGoalStore(selectGoal(goalId || ''));
  const { updateProgress } = useGoalStore();
  const projects = useProjectStore((s) => s.projects);
  const users = useUserStore((s) => s.users);
  const navigate = useNavigate();

  if (!goal) {
    return <div className="flex items-center justify-center h-full text-[#999999] dark:text-[#6B6B6B]">Goal not found</div>;
  }

  const owner = users[goal.ownerId];
  const linkedProjects = goal.linkedProjectIds.map((id) => projects[id]).filter(Boolean);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar title={goal.title} subtitle="Goal" />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-6 space-y-6">
          {/* Progress card */}
          <div className="bg-white dark:bg-[#2E2E2E] rounded-xl p-5 border border-[#E0E0E0] dark:border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[#111111] dark:text-white">Progress</h2>
              <span className="text-2xl font-black text-[#111111] dark:text-white">{goal.progress}%</span>
            </div>
            <ProgressBar value={goal.progress} height="h-4" />
            <div className="flex items-center justify-between mt-3">
              <Button variant="ghost" size="sm" onClick={() => updateProgress(goal.id, Math.max(0, goal.progress - 5))}>-5%</Button>
              <Button variant="ghost" size="sm" onClick={() => updateProgress(goal.id, Math.min(100, goal.progress + 5))}>+5%</Button>
            </div>
          </div>

          {/* Details */}
          <div className="bg-white dark:bg-[#2E2E2E] rounded-xl p-5 border border-[#E0E0E0] dark:border-white/10">
            <h2 className="text-base font-bold text-[#111111] dark:text-white mb-4">Details</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-xs text-[#555555] dark:text-[#A0A0A0] w-20">Owner</span>
                {owner && (
                  <div className="flex items-center gap-2">
                    <Avatar user={owner} size="xs" />
                    <span className="text-sm text-[#111111] dark:text-white">{owner.name}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-[#555555] dark:text-[#A0A0A0] w-20">Timeframe</span>
                <span className="text-sm text-[#111111] dark:text-white">{goal.timeframe} {goal.year}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-[#555555] dark:text-[#A0A0A0] w-20">Status</span>
                <span className="text-sm text-[#111111] dark:text-white capitalize">{goal.status.replace('_', ' ')}</span>
              </div>
              {goal.description && (
                <div>
                  <span className="text-xs text-[#555555] dark:text-[#A0A0A0] block mb-1">Description</span>
                  <p className="text-sm text-[#333333] dark:text-[#D0D0D0]">{goal.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Linked projects */}
          {linkedProjects.length > 0 && (
            <div className="bg-white dark:bg-[#2E2E2E] rounded-xl p-5 border border-[#E0E0E0] dark:border-white/10">
              <h2 className="text-base font-bold text-[#111111] dark:text-white mb-4">Linked Projects ({linkedProjects.length})</h2>
              <div className="space-y-2">
                {linkedProjects.map((project) => (
                  <div
                    key={project.id}
                    onClick={() => navigate(`/projects/${project.id}`)}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors"
                  >
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color }} />
                    <span className="text-sm text-[#111111] dark:text-white flex-1">{project.name}</span>
                    <ProjectStatusBadge status={project.status} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
