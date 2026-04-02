import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useShallow } from 'zustand/react/shallow';
import { useTaskStore } from '../../store/taskStore';
import { useUserStore } from '../../store/userStore';
import { useUIStore } from '../../store/uiStore';
import { getUserInitials } from '../../utils/task.utils';

export const WorkloadChart: React.FC = () => {
  const allTasks = useTaskStore(useShallow((s) => Object.values(s.tasks)));
  const allUsers = useUserStore(useShallow((s) => Object.values(s.users)));
  const theme = useUIStore((s) => s.theme);
  const isDark = theme === 'dark';
  const tickColor = isDark ? '#6B6B6B' : '#999999';
  const gridStroke = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';

  const data = allUsers.map((user) => {
    const count = allTasks.filter((t) => t.assigneeId === user.id && t.status !== 'done' && !t.isArchived).length;
    return {
      name: getUserInitials(user.name),
      fullName: user.name,
      tasks: count,
    };
  }).sort((a, b) => b.tasks - a.tasks);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-[#2E2E2E] border border-[#E0E0E0] dark:border-white/10 rounded-lg px-3 py-2 text-xs shadow-card">
          <p className="text-[#111111] dark:text-white">{payload[0].payload.fullName}</p>
          <p className="text-[#44AADF]">{payload[0].value} open tasks</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-[#2E2E2E] rounded-xl p-4 border border-[#E0E0E0] dark:border-white/10 card-lift animate-fade-slide-up">
      <h3 className="text-sm font-semibold text-[#111111] dark:text-white mb-4">Team Workload</h3>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
          <XAxis dataKey="name" tick={{ fill: tickColor, fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: tickColor, fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="tasks" fill="#44AADF" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
