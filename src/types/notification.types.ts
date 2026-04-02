export type NotificationType =
  | 'task_assigned'
  | 'task_completed'
  | 'task_commented'
  | 'task_due_soon'
  | 'task_overdue'
  | 'project_status_update'
  | 'mention'
  | 'task_added_to_project'
  | 'member_added';

export interface Notification {
  id: string;
  type: NotificationType;
  userId: string;
  actorId: string;
  taskId?: string;
  projectId?: string;
  commentId?: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}
