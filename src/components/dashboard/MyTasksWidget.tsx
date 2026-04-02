import React from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useTaskStore } from '../../store/taskStore';
import { useUserStore, selectCurrentUser } from '../../store/userStore';
import { useUIStore } from '../../store/uiStore';
import { getPriorityColor, getStatusLabel } from '../../utils/task.utils';
import { getRelativeDateLabel, isOverdue } from '../../utils/date.utils';
import { cn } from '../../utils/cn';
import { useNavigate } from 'react-router-dom';

export const MyTasksWidget: React.FC = () => {
  const currentUser = useUserStore(selectCurrentUser);
  const userId = currentUser?.id || '';
  const myTasks = useTaskStore(useShallow((s) =>
    Object.values(s.tasks).filter((t) => t.assigneeId === userId && !t.isArchived && t.status !== 'done')
  ));
  const { openTaskDetail } = useUIStore();
  const navigate = useNavigate();

  const urgent = myTasks.filter((t) => t.priority === 'urgent' || t.priority === 'high').slice(0, 5);

  return (
    <div className="bg-white dark:bg-[#2E2E2E] rounded-xl p-4 border border-[#E0E0E0] dark:border-white/10 card-lift animate-fade-slide-up">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-[#111111] dark:text-white">My Tasks</h3>
        <button
          onClick={() => navigate('/my-tasks')}
          className="text-xs text-[#44AADF] hover:text-[#3399CE] transition-colors"
        >
          View all ({myTasks.length})
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-black/5 dark:bg-white/5 rounded-lg p-2 text-center">
          <p className="text-lg font-bold text-[#111111] dark:text-white">{myTasks.filter((t) => t.status === 'in_progress').length}</p>
          <p className="text-[10px] text-[#999999] dark:text-[#6B6B6B]">In Progress</p>
        </div>
        <div className="bg-black/5 dark:bg-white/5 rounded-lg p-2 text-center">
          <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{myTasks.filter((t) => isOverdue(t.dueDate)).length}</p>
          <p className="text-[10px] text-[#999999] dark:text-[#6B6B6B]">Overdue</p>
        </div>
        <div className="bg-black/5 dark:bg-white/5 rounded-lg p-2 text-center">
          <p className="text-lg font-bold text-[#44AADF]">{myTasks.length}</p>
          <p className="text-[10px] text-[#999999] dark:text-[#6B6B6B]">Total Open</p>
        </div>
      </div>

      {/* High priority tasks */}
      {urgent.length > 0 && (
        <div>
          <p className="text-[10px] text-[#999999] dark:text-[#6B6B6B] mb-1.5 uppercase tracking-wider">High priority</p>
          <div className="space-y-1">
            {urgent.map((task) => (
              <div
                key={task.id}
                onClick={() => openTaskDetail(task.id)}
                className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer group transition-colors border-l-2"
                style={{ borderLeftColor: getPriorityColor(task.priority) }}
              >
                <span className="text-xs text-[#111111] dark:text-white truncate flex-1 group-hover:text-[#44AADF] transition-colors">{task.title}</span>
                {task.dueDate && (
                  <span className={cn('text-[10px] flex-shrink-0', isOverdue(task.dueDate) ? 'text-red-500 dark:text-red-400' : 'text-[#999999] dark:text-[#6B6B6B]')}>
                    {getRelativeDateLabel(task.dueDate)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
