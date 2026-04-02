export type ProjectStatus = 'on_track' | 'at_risk' | 'off_track' | 'on_hold' | 'complete';
export type ProjectRole = 'owner' | 'editor' | 'commenter' | 'viewer';

export interface ProjectMember {
  userId: string;
  role: ProjectRole;
}

export interface StatusUpdate {
  id: string;
  projectId: string;
  authorId: string;
  status: ProjectStatus;
  body: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  status: ProjectStatus;
  ownerId: string;
  members: ProjectMember[];
  sectionIds: string[];
  customFields: any[];
  startDate: string | null;
  dueDate: string | null;
  statusUpdates: StatusUpdate[];
  teamId: string | null;
  isArchived: boolean;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Section {
  id: string;
  name: string;
  projectId: string;
  taskIds: string[];
  isCollapsed: boolean;
  position: number;
}
