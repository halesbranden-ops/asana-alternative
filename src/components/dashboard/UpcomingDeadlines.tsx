import React from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useTaskStore } from '../../store/taskStore';
import { useProjectStore } from '../../store/projectStore';
import { useUIStore } from '../../store/uiStore';
import { getUpcomingTasks, getRelativeDateLabel, isOverdue } from '../../utils/date.utils';
import { getPriorityColor } from '../../utils/task.utils';
import { cn } from '../../utils/cn';

export const UpcomingDeadlines: React.FC = () => {
  const allTasks = useTaskStore(useShallow((s) => Object.values(s.tasks)));
  const projects = useProjectStore((s) => s.projects);
  const { openTaskDetail } = useUIStore();

  const overdueTasks = allTasks.filter((t) => isOverdue(t.dueDate) && t.status !== 'done' && !t.isArchived);
  const upcoming = getUpcomingTasks(allTasks.filter((t) => !t.isArchived), 7);

  const combined = [...overdueTasks, ...upcoming].slice(0, 8);

  if (combined.length === 0) {
    return (
      <div className="bg-white dark:bg-[#2E2E2E] rounded-xl p-4 border border-[#E0E0E0] dark:border-white/10 card-lift animate-fade-slide-up">
        <h3 className="text-sm font-semibold text-[#111111] dark:text-white mb-3">Upcoming Deadlines</h3>
        <p className="text-xs text-[#999999] dark:text-[#6B6B6B] text-center py-4">No upcoming deadlines</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#2E2E2E] rounded-xl p-4 border border-[#E0E0E0] dark:border-white/10">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-[#111111] dark:text-white">Upcoming Deadlines</h3>
        <span className="text-xs text-[#999999] dark:text-[#6B6B6B]">{combined.length} tasks</span>
      </div>
      <div className="space-y-2">
        {combined.map((task) => {
          const project = projects[task.projectId];
          const isTaskOverdue = isOverdue(task.dueDate);
          return (
            <div
              key={task.id}
              onClick={() => openTaskDetail(task.id)}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors group border-l-2"
              style={{ borderLeftColor: getPriorityColor(task.priority) }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-[#111111] dark:text-white truncate group-hover:text-[#44AADF] transition-colors">{task.title}</p>
                {project && <p className="text-[10px] text-[#999999] dark:text-[#6B6B6B]">{project.name}</p>}
              </div>
              <span className={cn('text-[10px] font-medium flex-shrink-0', isTaskOverdue ? 'text-red-500 dark:text-red-400' : 'text-[#555555] dark:text-[#A0A0A0]')}>
                {getRelativeDateLabel(task.dueDate)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
