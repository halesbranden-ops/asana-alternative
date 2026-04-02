import React from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useTaskStore } from '../../store/taskStore';
import { useProjectStore } from '../../store/projectStore';
import { useUserStore, selectCurrentUser } from '../../store/userStore';
import { isOverdue } from '../../utils/date.utils';

const StatCard: React.FC<{ label: string; value: string | number; color?: string; sub?: string }> = ({
  label, value, color, sub,
}) => (
  <div className="bg-black/[0.03] dark:bg-white/5 rounded-xl p-4 flex flex-col gap-1 hover:-translate-y-0.5 hover:shadow-card transition-all duration-150">
    <p className="text-xs text-[#555555] dark:text-[#A0A0A0]">{label}</p>
    <p className="text-2xl font-bold text-[#111111] dark:text-white" style={color ? { color } : undefined}>
      {value}
    </p>
    {sub && <p className="text-xs text-[#999999] dark:text-[#6B6B6B]">{sub}</p>}
  </div>
);

export const StatsWidget: React.FC = () => {
  const currentUser = useUserStore(selectCurrentUser);
  const allTasks = useTaskStore(useShallow((s) => Object.values(s.tasks).filter((t) => !t.isArchived)));
  const projects = useProjectStore(useShallow((s) => Object.values(s.projects).filter((p) => !p.isArchived)));

  const completedToday = allTasks.filter((t) => {
    if (!t.completedAt) return false;
    const d = new Date(t.completedAt);
    const today = new Date();
    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    );
  }).length;

  const myOverdue   = allTasks.filter((t) => t.assigneeId === currentUser?.id && isOverdue(t.dueDate) && t.status !== 'done').length;
  const myInProgress = allTasks.filter((t) => t.assigneeId === currentUser?.id && t.status === 'in_progress').length;
  const doneCount   = allTasks.filter((t) => t.status === 'done').length;
  const activeProjects = projects.filter((p) => p.status !== 'complete').length;

  return (
    <div className="bg-white dark:bg-[#2E2E2E] rounded-xl p-4 border border-[#E0E0E0] dark:border-white/10 card-lift animate-fade-slide-up">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-[#111111] dark:text-white">Quick Stats</h3>
        {completedToday > 0 && (
          <span className="text-xs text-green-600 dark:text-green-400 font-medium">
            🎉 {completedToday} done today
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="My In Progress" value={myInProgress} color="#44AADF" />
        <StatCard label="Overdue" value={myOverdue} color={myOverdue > 0 ? '#EF4444' : undefined} />
        <StatCard label="Tasks Done" value={doneCount} color="#22C55E" sub="all time" />
        <StatCard label="Active Projects" value={activeProjects} />
      </div>
    </div>
  );
};
