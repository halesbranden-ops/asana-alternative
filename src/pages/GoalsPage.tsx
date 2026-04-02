import React from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '../components/layout/TopBar';
import { useGoalStore } from '../store/goalStore';
import { useUserStore } from '../store/userStore';
import { Avatar } from '../components/ui/Avatar';
import { ProgressBar } from '../components/ui/ProgressBar';
import { cn } from '../utils/cn';

const statusColors: Record<string, string> = {
  on_track: 'text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-500/20',
  at_risk: 'text-yellow-700 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-500/20',
  off_track: 'text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-500/20',
  achieved: 'text-[#44AADF] bg-[#44AADF]/10 dark:bg-[#44AADF]/20',
  missed: 'text-[#555555] dark:text-[#A0A0A0] bg-black/5 dark:bg-white/10',
};

const statusLabels: Record<string, string> = {
  on_track: 'On Track',
  at_risk: 'At Risk',
  off_track: 'Off Track',
  achieved: 'Achieved',
  missed: 'Missed',
};

const goalColors: Record<string, string> = {
  on_track: '#22C55E',
  at_risk: '#EAB308',
  off_track: '#EF4444',
  achieved: '#44AADF',
  missed: '#6B7280',
};

export const GoalsPage: React.FC = () => {
  const goals = useGoalStore(useShallow((s) => Object.values(s.goals)));
  const users = useUserStore((s) => s.users);
  const navigate = useNavigate();

  const topLevelGoals = goals.filter((g) => !g.parentGoalId);
  const getSubGoals = (parentId: string) => goals.filter((g) => g.parentGoalId === parentId);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar title="Goals" subtitle={`${topLevelGoals.length} goals`} />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-6 space-y-4">
          {topLevelGoals.map((goal) => {
            const owner = users[goal.ownerId];
            const subGoals = getSubGoals(goal.id);

            return (
              <div
                key={goal.id}
                className="bg-white dark:bg-[#2E2E2E] border border-[#E0E0E0] dark:border-white/10 rounded-xl overflow-hidden"
              >
                <div
                  className="p-5 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  onClick={() => navigate(`/goals/${goal.id}`)}
                >
                  <div className="flex items-start gap-4">
                    {/* Progress ring */}
                    <div className="flex-shrink-0 relative w-12 h-12">
                      <svg viewBox="0 0 36 36" className="w-12 h-12 -rotate-90">
                        <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(0,0,0,0.08)" className="dark:stroke-white/10" strokeWidth="3" />
                        <circle
                          cx="18" cy="18" r="14" fill="none"
                          stroke={goalColors[goal.status]}
                          strokeWidth="3"
                          strokeDasharray={`${(goal.progress / 100) * 87.96} 87.96`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-[#111111] dark:text-white">
                        {goal.progress}%
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-base font-bold text-[#111111] dark:text-white mb-1">{goal.title}</h3>
                          <p className="text-xs text-[#555555] dark:text-[#A0A0A0] line-clamp-2">{goal.description}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', statusColors[goal.status])}>
                            {statusLabels[goal.status]}
                          </span>
                          <span className="text-xs text-[#555555] dark:text-[#A0A0A0] bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded">{goal.timeframe} {goal.year}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mt-3">
                        {owner && (
                          <div className="flex items-center gap-1.5">
                            <Avatar user={owner} size="xs" />
                            <span className="text-xs text-[#555555] dark:text-[#A0A0A0]">{owner.name}</span>
                          </div>
                        )}
                        <span className="text-xs text-[#999999] dark:text-[#6B6B6B]">•</span>
                        <span className="text-xs text-[#555555] dark:text-[#A0A0A0]">{goal.linkedProjectIds.length} linked projects</span>
                        {subGoals.length > 0 && (
                          <>
                            <span className="text-xs text-[#999999] dark:text-[#6B6B6B]">•</span>
                            <span className="text-xs text-[#555555] dark:text-[#A0A0A0]">{subGoals.length} sub-goals</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sub-goals */}
                {subGoals.length > 0 && (
                  <div className="border-t border-[#E0E0E0] dark:border-white/5 divide-y divide-[#E0E0E0] dark:divide-white/5">
                    {subGoals.map((subGoal) => {
                      const subOwner = users[subGoal.ownerId];
                      return (
                        <div
                          key={subGoal.id}
                          className="flex items-center gap-4 px-5 py-3 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors"
                          onClick={() => navigate(`/goals/${subGoal.id}`)}
                        >
                          <div className="w-8 h-8 flex items-center justify-center ml-6">
                            <svg viewBox="0 0 28 28" className="w-8 h-8 -rotate-90">
                              <circle cx="14" cy="14" r="10" fill="none" stroke="rgba(0,0,0,0.08)" className="dark:stroke-white/10" strokeWidth="2.5" />
                              <circle
                                cx="14" cy="14" r="10" fill="none"
                                stroke={goalColors[subGoal.status]}
                                strokeWidth="2.5"
                                strokeDasharray={`${(subGoal.progress / 100) * 62.8} 62.8`}
                                strokeLinecap="round"
                              />
                            </svg>
                          </div>
                          <span className="text-sm text-[#333333] dark:text-[#D0D0D0] flex-1">{subGoal.title}</span>
                          <span className="text-xs font-medium text-[#555555] dark:text-[#A0A0A0]">{subGoal.progress}%</span>
                          <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', statusColors[subGoal.status])}>
                            {statusLabels[subGoal.status]}
                          </span>
                          {subOwner && <Avatar user={subOwner} size="xs" />}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
