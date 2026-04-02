import React from 'react';
import { Project } from '../../types';
import { useUserStore } from '../../store/userStore';
import { Avatar } from '../ui/Avatar';
import { AvatarGroup } from '../ui/AvatarGroup';
import { ProjectStatusBadge } from '../ui/Badge';
import { formatDate } from '../../utils/date.utils';

interface ProjectHeaderProps {
  project: Project;
}

export const ProjectHeader: React.FC<ProjectHeaderProps> = ({ project }) => {
  const users = useUserStore((s) => s.users);
  const members = project.members.map((m) => users[m.userId]).filter(Boolean);

  return (
    <div className="flex items-center gap-4 px-6 py-4 border-b border-[#E0E0E0] dark:border-white/10 bg-white dark:bg-[#2A2A2A]">
      {/* Color indicator */}
      <div
        className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-lg"
        style={{ backgroundColor: project.color + '33', border: `1.5px solid ${project.color}` }}
      >
        {project.icon}
      </div>

      {/* Name and meta */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-lg font-bold text-[#111111] dark:text-white">{project.name}</h1>
          <ProjectStatusBadge status={project.status} />
          {project.isPrivate && (
            <span className="text-xs text-[#555555] dark:text-[#A0A0A0] flex items-center gap-1">
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><rect x="2" y="5" width="8" height="6" rx="1" stroke="currentColor" strokeWidth="1.3"/><path d="M4 5V4a2 2 0 014 0v1" stroke="currentColor" strokeWidth="1.3"/></svg>
              Private
            </span>
          )}
        </div>
        {project.dueDate && (
          <p className="text-xs text-[#555555] dark:text-[#A0A0A0] mt-0.5">Due {formatDate(project.dueDate, 'MMMM d, yyyy')}</p>
        )}
      </div>

      {/* Members */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <AvatarGroup users={members} max={4} size="sm" />
      </div>
    </div>
  );
};
