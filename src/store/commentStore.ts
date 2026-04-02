import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { Comment } from '../types';
import { generateId } from '../utils/id.utils';

interface CommentState {
  comments: Record<string, Comment>;
}

interface CommentActions {
  seedComments: (comments: Comment[]) => void;
  addComment: (comment: Omit<Comment, 'id' | 'createdAt' | 'updatedAt' | 'isEdited'>) => Comment;
  updateComment: (id: string, body: string) => void;
  deleteComment: (id: string) => void;
  addReaction: (commentId: string, emoji: string, userId: string) => void;
  removeReaction: (commentId: string, emoji: string, userId: string) => void;
}

type CommentStore = CommentState & CommentActions;

export const useCommentStore = create<CommentStore>()(
  persist(
    immer((set) => ({
      comments: {},

      seedComments: (comments) =>
        set((state) => {
          comments.forEach((c) => {
            state.comments[c.id] = c;
          });
        }),

      addComment: (data) => {
        const now = new Date().toISOString();
        const newComment: Comment = {
          ...data,
          id: generateId('comment'),
          createdAt: now,
          updatedAt: now,
          isEdited: false,
        };
        set((state) => {
          state.comments[newComment.id] = newComment;
        });
        return newComment;
      },

      updateComment: (id, body) =>
        set((state) => {
          if (state.comments[id]) {
            state.comments[id].body = body;
            state.comments[id].updatedAt = new Date().toISOString();
            state.comments[id].isEdited = true;
          }
        }),

      deleteComment: (id) =>
        set((state) => {
          delete state.comments[id];
        }),

      addReaction: (commentId, emoji, userId) =>
        set((state) => {
          if (state.comments[commentId]) {
            if (!state.comments[commentId].reactions[emoji]) {
              state.comments[commentId].reactions[emoji] = [];
            }
            if (!state.comments[commentId].reactions[emoji].includes(userId)) {
              state.comments[commentId].reactions[emoji].push(userId);
            }
          }
        }),

      removeReaction: (commentId, emoji, userId) =>
        set((state) => {
          if (state.comments[commentId]?.reactions[emoji]) {
            state.comments[commentId].reactions[emoji] = state.comments[commentId].reactions[emoji].filter(
              (id) => id !== userId
            );
          }
        }),
    })),
    { name: 'bullfit-comments-v2' }
  )
);

export const selectTaskComments = (taskId: string) => (state: CommentStore) =>
  Object.values(state.comments)
    .filter((c) => c.taskId === taskId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
