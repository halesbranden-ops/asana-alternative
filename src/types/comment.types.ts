export interface Comment {
  id: string;
  taskId: string;
  authorId: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  reactions: Record<string, string[]>;
  isEdited: boolean;
}
