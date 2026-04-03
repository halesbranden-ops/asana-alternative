import React from 'react';
import { Project } from '../../types';
import { useUserStore } from '../../store/userStore';
import { useUIStore } from '../../store/uiStore';
import { AvatarGroup } from '../ui/AvatarGroup';
import { ProjectStatusBadge } from '../ui/Badge';
import { ProjectInitial } from './ProjectInitial';
import { formatDate } from '../../utils/date.utils';

interface ProjectHeaderProps {
  project: Project;
}

export const ProjectHeader: React.FC<ProjectHeaderProps> = ({ project }) => {
  const users = useUserStore((s) => s.users);
  const openProjectEdit = useUIStore((s) => s.openProjectEdit);
  const members = project.members.map((m) => users[m.userId]).filter(Boolean);

  return (
    <div className="flex items-center gap-3 px-3 sm:px-6 py-3 sm:py-4 border-b border-[#E0E0E0] dark:border-white/10 bg-white dark:bg-[#2A2A2A]">
      {/* Project initial */}
      <ProjectInitial name={project.name} color={project.color} size={36} />

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

      {/* Members + edit button */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <AvatarGroup users={members} max={4} size="sm" />
        <button
          onClick={() => openProjectEdit(project.id)}
          title="Edit project"
          className="p-1.5 rounded-lg text-[#AAAAAA] dark:text-[#555555] hover:text-[#111111] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        >
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
            <path d="M11.5 2.5a1.414 1.414 0 012 2L5 13H3v-2L11.5 2.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
};
