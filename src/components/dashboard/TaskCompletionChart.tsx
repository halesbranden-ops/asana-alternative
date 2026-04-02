import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useShallow } from 'zustand/react/shallow';
import { useTaskStore } from '../../store/taskStore';
import { useUIStore } from '../../store/uiStore';
import { format, subWeeks, startOfWeek, endOfWeek, eachWeekOfInterval, parseISO, isValid, isWithinInterval } from 'date-fns';

export const TaskCompletionChart: React.FC = () => {
  const tasks = useTaskStore(useShallow((s) => Object.values(s.tasks)));
  const theme = useUIStore((s) => s.theme);
  const isDark = theme === 'dark';
  const tickColor = isDark ? '#6B6B6B' : '#999999';
  const gridStroke = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';

  const now = new Date();
  const weeks = eachWeekOfInterval({
    start: subWeeks(now, 5),
    end: now,
  }, { weekStartsOn: 0 });

  const data = weeks.map((weekStart) => {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 0 });
    const completed = tasks.filter((t) => {
      if (!t.completedAt) return false;
      try {
        const date = parseISO(t.completedAt);
        return isValid(date) && isWithinInterval(date, { start: weekStart, end: weekEnd });
      } catch {
        return false;
      }
    }).length;

    const created = tasks.filter((t) => {
      try {
        const date = parseISO(t.createdAt);
        return isValid(date) && isWithinInterval(date, { start: weekStart, end: weekEnd });
      } catch {
        return false;
      }
    }).length;

    return {
      week: format(weekStart, 'MMM d'),
      completed,
      created,
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-[#2E2E2E] border border-[#E0E0E0] dark:border-white/10 rounded-lg px-3 py-2 text-xs shadow-card">
          <p className="text-[#555555] dark:text-[#A0A0A0] mb-1">Week of {label}</p>
          {payload.map((entry: any) => (
            <p key={entry.name} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-[#2E2E2E] rounded-xl p-4 border border-[#E0E0E0] dark:border-white/10 card-lift animate-fade-slide-up">
      <h3 className="text-sm font-semibold text-[#111111] dark:text-white mb-4">Task Completion</h3>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
          <XAxis dataKey="week" tick={{ fill: tickColor, fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: tickColor, fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="completed" name="Completed" fill="#44AADF" radius={[4, 4, 0, 0]} />
          <Bar dataKey="created" name="Created" fill="rgba(68,170,223,0.25)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
