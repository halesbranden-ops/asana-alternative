import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TopBar } from '../components/layout/TopBar';
import { useTeamStore, selectTeam } from '../store/teamStore';
import { useUserStore } from '../store/userStore';
import { useProjectStore } from '../store/projectStore';
import { useTaskStore } from '../store/taskStore';
import { Avatar } from '../components/ui/Avatar';
import { ProjectStatusBadge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { getTaskCompletionPercent } from '../utils/task.utils';
import { User } from '../types';

export const TeamDetailPage: React.FC = () => {
  const { teamId } = useParams();
  const team = useTeamStore(selectTeam(teamId || ''));
  const users = useUserStore((s) => s.users);
  const projects = useProjectStore((s) => s.projects);
  const allTasks = useTaskStore((s) => s.tasks);
  const navigate = useNavigate();

  if (!team) {
    return <div className="flex items-center justify-center h-full text-[#999999] dark:text-[#6B6B6B]">Team not found</div>;
  }

  const members = team.memberIds.map((id) => users[id]).filter(Boolean) as User[];
  const teamProjects = team.projectIds.map((id) => projects[id]).filter(Boolean);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar title={team.name} subtitle="Team" />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
          {/* Members */}
          <div className="bg-white dark:bg-[#2E2E2E] rounded-xl p-5 border border-[#E0E0E0] dark:border-white/10">
            <h2 className="text-base font-bold text-[#111111] dark:text-white mb-4">Members ({members.length})</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {members.map((user) => {
                const taskCount = Object.values(allTasks).filter(
                  (t) => t.assigneeId === user.id && !t.isArchived && t.status !== 'done'
                ).length;
                return (
                  <div key={user.id} className="flex items-center gap-3 p-3 bg-black/5 dark:bg-white/5 rounded-lg">
                    <Avatar user={user} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#111111] dark:text-white truncate">{user.name}</p>
                      <p className="text-xs text-[#555555] dark:text-[#A0A0A0]">{user.role}</p>
                    </div>
                    <span className="text-xs text-[#555555] dark:text-[#A0A0A0] flex-shrink-0">{taskCount} open tasks</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Projects */}
          <div className="bg-white dark:bg-[#2E2E2E] rounded-xl p-5 border border-[#E0E0E0] dark:border-white/10">
            <h2 className="text-base font-bold text-[#111111] dark:text-white mb-4">Projects ({teamProjects.length})</h2>
            <div className="space-y-3">
              {teamProjects.map((project) => {
                const pTasks = Object.values(allTasks).filter((t) => t.projectId === project.id && !t.isArchived);
                const pct = getTaskCompletionPercent(pTasks);
                return (
                  <div
                    key={project.id}
                    onClick={() => navigate(`/projects/${project.id}`)}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors"
                  >
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: project.color }} />
                    <span className="text-sm font-medium text-[#111111] dark:text-white flex-1 truncate">{project.name}</span>
                    <div className="w-24 flex-shrink-0">
                      <ProgressBar value={pct} height="h-1.5" color={project.color} />
                    </div>
                    <span className="text-xs text-[#555555] dark:text-[#A0A0A0] w-8 text-right">{pct}%</span>
                    <ProjectStatusBadge status={project.status} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
