export type Priority = 'urgent' | 'high' | 'medium' | 'low' | 'none';
export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done' | 'blocked';

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string;
  uploadedById: string;
}

export interface CustomField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'checkbox';
  options?: string[];
  projectId: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  projectId: string;
  sectionId: string;
  parentTaskId: string | null;
  subtaskIds: string[];
  dependsOnIds: string[];
  blockingIds: string[];
  assigneeId: string | null;
  followerIds: string[];
  status: TaskStatus;
  priority: Priority;
  tags: string[];
  customFields: Record<string, any>;
  dueDate: string | null;
  startDate: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdById: string;
  commentIds: string[];
  attachments: Attachment[];
  isArchived: boolean;
  position: number;
  columnId: string;
}

export interface TaskFilter {
  assigneeId?: string | null;
  priority?: Priority | null;
  status?: TaskStatus | null;
  dueDateRange?: { start: string; end: string } | null;
  tags?: string[];
  search?: string;
}

export type TaskSortBy = 'dueDate' | 'priority' | 'status' | 'createdAt' | 'title' | 'assignee';
export type TaskGroupBy = 'status' | 'priority' | 'assignee' | 'dueDate' | 'none';
