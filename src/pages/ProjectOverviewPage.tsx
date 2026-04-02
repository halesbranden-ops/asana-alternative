import React, { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { Project } from '../types';
import { useTaskStore } from '../store/taskStore';
import { useUserStore } from '../store/userStore';
import { useProjectStore } from '../store/projectStore';
import { useUIStore } from '../store/uiStore';
import { Avatar } from '../components/ui/Avatar';
import { ProjectStatusBadge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Textarea } from '../components/ui/Textarea';
import { Select } from '../components/ui/Select';
import { getTaskCompletionPercent, getProjectStatusLabel } from '../utils/task.utils';
import { formatDate, timeAgo, isOverdue } from '../utils/date.utils';
import { ProjectStatus } from '../types';

interface ProjectOverviewPageProps {
  project: Project;
}

export const ProjectOverviewPage: React.FC<ProjectOverviewPageProps> = ({ project }) => {
  const allTasks = useTaskStore(useShallow((s) => Object.values(s.tasks).filter((t) => t.projectId === project.id && !t.isArchived)));
  const users = useUserStore((s) => s.users);
  const { postStatusUpdate } = useProjectStore();
  const currentUser = useUserStore((s) => s.users[s.currentUserId]);
  const { addToast } = useUIStore() as any;

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusForm, setStatusForm] = useState({ status: project.status, body: '' });

  const completionPct = getTaskCompletionPercent(allTasks);
  const inProgress = allTasks.filter((t) => t.status === 'in_progress').length;
  const inReview = allTasks.filter((t) => t.status === 'in_review').length;
  const overdueTasks = allTasks.filter((t) => isOverdue(t.dueDate) && t.status !== 'done');

  const handleStatusUpdate = () => {
    if (!statusForm.body.trim()) return;
    postStatusUpdate(project.id, {
      projectId: project.id,
      authorId: currentUser?.id || 'user-1',
      status: statusForm.status,
      body: statusForm.body,
      createdAt: new Date().toISOString(),
    });
    if (typeof addToast === 'function') {
      addToast({ type: 'success', message: 'Status update posted' });
    }
    setIsStatusModalOpen(false);
    setStatusForm({ status: project.status, body: '' });
  };

  const statusOptions = [
    { value: 'on_track', label: 'On Track' },
    { value: 'at_risk', label: 'At Risk' },
    { value: 'off_track', label: 'Off Track' },
    { value: 'on_hold', label: 'On Hold' },
    { value: 'complete', label: 'Complete' },
  ];

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
        {/* Status card */}
        <div className="bg-white dark:bg-[#2E2E2E] rounded-xl p-5 border border-[#E0E0E0] dark:border-white/10">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-[#111111] dark:text-white mb-2">Project Health</h2>
              <ProjectStatusBadge status={project.status} />
            </div>
            <Button variant="secondary" size="sm" onClick={() => setIsStatusModalOpen(true)}>
              Post Update
            </Button>
          </div>

          {/* Progress */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#555555] dark:text-[#A0A0A0]">Overall Progress</span>
              <span className="text-sm font-semibold text-[#111111] dark:text-white">{completionPct}%</span>
            </div>
            <ProgressBar value={completionPct} height="h-3" color={project.color} />
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-black/5 dark:bg-white/5 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-[#111111] dark:text-white">{allTasks.length}</p>
              <p className="text-xs text-[#999999] dark:text-[#6B6B6B]">Total Tasks</p>
            </div>
            <div className="bg-black/5 dark:bg-white/5 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-green-600 dark:text-green-400">{allTasks.filter((t) => t.status === 'done').length}</p>
              <p className="text-xs text-[#999999] dark:text-[#6B6B6B]">Complete</p>
            </div>
            <div className="bg-black/5 dark:bg-white/5 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-[#44AADF]">{inProgress + inReview}</p>
              <p className="text-xs text-[#999999] dark:text-[#6B6B6B]">In Progress</p>
            </div>
            <div className="bg-black/5 dark:bg-white/5 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-red-500 dark:text-red-400">{overdueTasks.length}</p>
              <p className="text-xs text-[#999999] dark:text-[#6B6B6B]">Overdue</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Team members */}
          <div className="bg-white dark:bg-[#2E2E2E] rounded-xl p-5 border border-[#E0E0E0] dark:border-white/10">
            <h2 className="text-base font-bold text-[#111111] dark:text-white mb-4">Team ({project.members.length})</h2>
            <div className="space-y-3">
              {project.members.map((member) => {
                const user = users[member.userId];
                if (!user) return null;
                const taskCount = allTasks.filter((t) => t.assigneeId === user.id).length;
                return (
                  <div key={member.userId} className="flex items-center gap-3">
                    <Avatar user={user} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#111111] dark:text-white truncate">{user.name}</p>
                      <p className="text-xs text-[#555555] dark:text-[#A0A0A0] capitalize">{member.role}</p>
                    </div>
                    <span className="text-xs text-[#999999] dark:text-[#6B6B6B]">{taskCount} tasks</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Status updates */}
          <div className="bg-white dark:bg-[#2E2E2E] rounded-xl p-5 border border-[#E0E0E0] dark:border-white/10">
            <h2 className="text-base font-bold text-[#111111] dark:text-white mb-4">Status Updates</h2>
            {project.statusUpdates.length === 0 ? (
              <p className="text-sm text-[#999999] dark:text-[#6B6B6B]">No updates yet</p>
            ) : (
              <div className="space-y-4">
                {project.statusUpdates.slice(0, 3).map((update) => {
                  const author = users[update.authorId];
                  return (
                    <div key={update.id} className="border-l-2 border-[#E0E0E0] dark:border-white/10 pl-3">
                      <div className="flex items-center gap-2 mb-1">
                        {author && <Avatar user={author} size="xs" />}
                        <span className="text-xs font-medium text-[#111111] dark:text-white">{author?.name}</span>
                        <ProjectStatusBadge status={update.status} />
                        <span className="text-xs text-[#999999] dark:text-[#6B6B6B] ml-auto">{timeAgo(update.createdAt)}</span>
                      </div>
                      <p className="text-xs text-[#333333] dark:text-[#D0D0D0] leading-relaxed">{update.body}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Overdue tasks */}
        {overdueTasks.length > 0 && (
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl p-5">
            <h2 className="text-base font-bold text-red-600 dark:text-red-400 mb-3">Overdue Tasks ({overdueTasks.length})</h2>
            <div className="space-y-2">
              {overdueTasks.slice(0, 5).map((task) => {
                const assignee = users[task.assigneeId || ''];
                return (
                  <div key={task.id} className="flex items-center gap-3">
                    <span className="text-xs text-red-500 dark:text-red-400 font-mono">{formatDate(task.dueDate)}</span>
                    <span className="text-sm text-[#111111] dark:text-white flex-1 truncate">{task.title}</span>
                    {assignee && <Avatar user={assignee} size="xs" />}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Status update modal */}
      <Modal isOpen={isStatusModalOpen} onClose={() => setIsStatusModalOpen(false)} title="Post Status Update" size="md">
        <div className="p-5 space-y-4">
          <Select
            label="Project status"
            value={statusForm.status}
            onChange={(e) => setStatusForm((f) => ({ ...f, status: e.target.value as ProjectStatus }))}
            options={statusOptions}
          />
          <Textarea
            label="Update message"
            value={statusForm.body}
            onChange={(e) => setStatusForm((f) => ({ ...f, body: e.target.value }))}
            placeholder="Share what's happening with the project..."
            rows={4}
          />
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setIsStatusModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleStatusUpdate} disabled={!statusForm.body.trim()}>
              Post Update
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
