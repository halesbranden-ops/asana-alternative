import React, { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { TopBar } from '../components/layout/TopBar';
import { useTaskStore } from '../store/taskStore';
import { useUserStore, selectCurrentUser } from '../store/userStore';
import { useUIStore } from '../store/uiStore';
import { TaskRow } from '../components/task/TaskRow';
import { groupTasksByDate } from '../utils/date.utils';
import { cn } from '../utils/cn';
import { Task } from '../types';

interface SectionGroupProps {
  title: string;
  tasks: Task[];
  defaultOpen?: boolean;
  accentColor: string;
  dotColor: string;
}

const SectionGroup: React.FC<SectionGroupProps> = ({
  title,
  tasks,
  defaultOpen = true,
  accentColor,
  dotColor,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (tasks.length === 0) return null;

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 mb-1 w-full text-left hover:bg-black/5 dark:hover:bg-white/5 px-3 py-2 rounded-lg transition-colors group"
      >
        {/* Chevron */}
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="currentColor"
          className={cn('text-[#555555] dark:text-[#A0A0A0] transition-transform flex-shrink-0', isOpen ? 'rotate-90' : '')}
        >
          <path d="M3 2l5 4-5 4V2z" />
        </svg>

        {/* Colored dot */}
        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: dotColor }} />

        {/* Section title */}
        <span className="text-sm font-bold" style={{ color: accentColor }}>
          {title}
        </span>

        {/* Count badge */}
        <span className="text-xs text-[#555555] dark:text-[#A0A0A0] bg-black/5 dark:bg-white/5 px-1.5 py-0.5 rounded">
          {tasks.length}
        </span>
      </button>

      {isOpen && (
        <div className="space-y-0.5 ml-2">
          {tasks.map((task) => (
            <TaskRow key={task.id} task={task} showProject />
          ))}
        </div>
      )}
    </div>
  );
};

export const MyTasksPage: React.FC = () => {
  const currentUser = useUserStore(selectCurrentUser);
  const userId = currentUser?.id || '';
  const myTasks = useTaskStore(
    useShallow((s) =>
      Object.values(s.tasks).filter(
        (t) => t.assigneeId === userId && !t.isArchived && t.status !== 'done'
      )
    )
  );
  const { openTaskCreate } = useUIStore();

  const { overdue, today, thisWeek, later, noDueDate, tomorrow } = groupTasksByDate(myTasks);

  // "This Week" bucket = tomorrow + rest-of-week (excludes today which is its own section)
  const thisWeekAndTomorrow = [...tomorrow, ...thisWeek];

  // "Later" bucket = anything beyond this calendar week + tasks with no due date
  const laterAndNoDueDate = [...later, ...noDueDate];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar
        title="My Tasks"
        subtitle={`${myTasks.length} open task${myTasks.length !== 1 ? 's' : ''}`}
        actions={
          <button
            onClick={() => openTaskCreate()}
            className="text-xs text-[#44AADF] hover:text-[#3399CE] transition-colors"
          >
            + New Task
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-6">
          {myTasks.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">🎉</div>
              <h3 className="text-lg font-semibold text-[#111111] dark:text-white mb-2">All caught up!</h3>
              <p className="text-[#555555] dark:text-[#A0A0A0] text-sm">You have no open tasks assigned to you.</p>
            </div>
          ) : (
            <>
              {/* Overdue — only shown when tasks exist, defaults open */}
              {overdue.length > 0 && (
                <SectionGroup
                  title="Overdue"
                  tasks={overdue}
                  defaultOpen={true}
                  accentColor="#DC2626"
                  dotColor="#EF4444"
                />
              )}

              {/* Today — defaults open */}
              <SectionGroup
                title="Today"
                tasks={today}
                defaultOpen={true}
                accentColor="#CA8A04"
                dotColor="#EAB308"
              />

              {/* This Week — after today through end of this Saturday, defaults open */}
              <SectionGroup
                title="This Week"
                tasks={thisWeekAndTomorrow}
                defaultOpen={true}
                accentColor="#16A34A"
                dotColor="#22C55E"
              />

              {/* Later — beyond this calendar week + no due date, defaults closed */}
              <SectionGroup
                title="Later"
                tasks={laterAndNoDueDate}
                defaultOpen={false}
                accentColor="#2563EB"
                dotColor="#3B82F6"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};
