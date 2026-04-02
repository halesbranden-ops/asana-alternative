import React, { useState } from 'react';
import { SlidePanel } from '../ui/SlidePanel';
import { useShallow } from 'zustand/react/shallow';
import { useUIStore } from '../../store/uiStore';
import { useTaskStore, selectTask } from '../../store/taskStore';
import { useUserStore, selectCurrentUser } from '../../store/userStore';
import { useCommentStore } from '../../store/commentStore';
import { Checkbox } from '../ui/Checkbox';
import { Avatar } from '../ui/Avatar';
import { PriorityBadge, StatusBadge } from '../ui/Badge';
import { DatePicker } from '../ui/DatePicker';
import { Textarea } from '../ui/Textarea';
import { TagInput } from '../ui/TagInput';
import { Button } from '../ui/Button';
import { Tabs } from '../ui/Tabs';
import { TaskRow } from './TaskRow';
import { Priority, TaskStatus } from '../../types';
import { getPriorityLabel, getStatusLabel } from '../../utils/task.utils';
import { timeAgo } from '../../utils/date.utils';
import { cn } from '../../utils/cn';

export const TaskDetailPanel: React.FC = () => {
  const { isTaskDetailOpen, taskDetailId, closeTaskDetail } = useUIStore();
  const task = useTaskStore(selectTask(taskDetailId || ''));
  const subtasks = useTaskStore(useShallow((s) => {
    const parent = s.tasks[taskDetailId || ''];
    if (!parent) return [];
    return parent.subtaskIds.map((id) => s.tasks[id]).filter(Boolean);
  }));
  const { updateTask, completeTask, uncompleteTask, addSubtask } = useTaskStore();
  const allUsers = useUserStore(useShallow((s) => Object.values(s.users)));
  const currentUser = useUserStore(selectCurrentUser);
  const comments = useCommentStore(useShallow((s) => {
    const taskId = taskDetailId || '';
    return Object.values(s.comments)
      .filter((c) => c.taskId === taskId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }));
  const { addComment: storeAddComment } = useCommentStore();
  const { addComment: addCommentToTask } = useTaskStore();

  const [activeTab, setActiveTab] = useState('details');
  const [commentText, setCommentText] = useState('');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);

  if (!task) return null;

  const assignee = allUsers.find((u) => u.id === task.assigneeId);
  const isDone = task.status === 'done';

  const handleAddComment = () => {
    const text = commentText.trim();
    if (!text || !currentUser) return;
    const comment = storeAddComment({
      taskId: task.id,
      authorId: currentUser.id,
      body: text,
      reactions: {},
    });
    addCommentToTask(task.id, comment.id);
    setCommentText('');
  };

  const handleAddSubtask = () => {
    const title = newSubtaskTitle.trim();
    if (!title) return;
    addSubtask(task.id, {
      title,
      description: '',
      projectId: task.projectId,
      sectionId: task.sectionId,
      parentTaskId: task.id,
      subtaskIds: [],
      dependsOnIds: [],
      blockingIds: [],
      assigneeId: null,
      followerIds: [],
      status: 'todo',
      priority: 'none',
      tags: [],
      customFields: {},
      dueDate: null,
      startDate: null,
      completedAt: null,
      createdById: currentUser?.id || 'user-1',
      commentIds: [],
      attachments: [],
      isArchived: false,
      position: subtasks.length,
      columnId: 'todo',
    });
    setNewSubtaskTitle('');
    setIsAddingSubtask(false);
  };

  const priorities: Priority[] = ['urgent', 'high', 'medium', 'low', 'none'];
  const statuses: TaskStatus[] = ['todo', 'in_progress', 'in_review', 'done', 'blocked'];

  const tabs = [
    { id: 'details', label: 'Details' },
    { id: 'subtasks', label: 'Subtasks', count: subtasks.length },
    { id: 'comments', label: 'Comments', count: comments.length },
  ];

  return (
    <SlidePanel isOpen={isTaskDetailOpen} onClose={closeTaskDetail} width="520px">
      {/* Header */}
      <div className="flex items-start gap-3 p-5 border-b border-[#E0E0E0] dark:border-white/10 flex-shrink-0">
        <div className="flex-shrink-0 mt-0.5">
          <Checkbox
            checked={isDone}
            onChange={(checked) => checked ? completeTask(task.id) : uncompleteTask(task.id)}
          />
        </div>
        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={task.title}
            onChange={(e) => updateTask(task.id, { title: e.target.value })}
            className={cn(
              'w-full text-lg font-bold text-[#111111] dark:text-white bg-transparent outline-none border-b border-transparent focus:border-[#44AADF]/50 transition-colors pb-1',
              isDone && 'line-through text-[#999999] dark:text-[#6B6B6B]'
            )}
            placeholder="Task title"
          />
        </div>
        <button
          onClick={closeTaskDetail}
          className="p-1.5 rounded-lg text-[#555555] dark:text-[#A0A0A0] hover:text-[#111111] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors flex-shrink-0"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Tabs */}
      <div className="px-5 pt-3 border-b border-[#E0E0E0] dark:border-white/10 flex-shrink-0">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {activeTab === 'details' && (
          <>
            {/* Assignee */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-[#999999] dark:text-[#6B6B6B] w-24 flex-shrink-0">Assignee</span>
              <div className="flex-1">
                <select
                  value={task.assigneeId || ''}
                  onChange={(e) => updateTask(task.id, { assigneeId: e.target.value || null })}
                  className="bg-black/5 dark:bg-white/5 border border-transparent hover:border-[#E0E0E0] dark:hover:border-white/10 rounded-lg px-2 py-1.5 text-sm text-[#111111] dark:text-white outline-none focus:border-[#44AADF]/50 transition-colors cursor-pointer w-full"
                >
                  <option value="">Unassigned</option>
                  {allUsers.map((u) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
              {assignee && <Avatar user={assignee} size="sm" />}
            </div>

            {/* Due date */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-[#999999] dark:text-[#6B6B6B] w-24 flex-shrink-0">Due date</span>
              <DatePicker
                value={task.dueDate}
                onChange={(date) => updateTask(task.id, { dueDate: date })}
              />
            </div>

            {/* Start date */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-[#999999] dark:text-[#6B6B6B] w-24 flex-shrink-0">Start date</span>
              <DatePicker
                value={task.startDate}
                onChange={(date) => updateTask(task.id, { startDate: date })}
                placeholder="Set start date"
              />
            </div>

            {/* Priority */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-[#999999] dark:text-[#6B6B6B] w-24 flex-shrink-0">Priority</span>
              <div className="flex gap-1.5 flex-wrap">
                {priorities.map((p) => (
                  <button
                    key={p}
                    onClick={() => updateTask(task.id, { priority: p })}
                    className={cn(
                      'px-2 py-1 rounded-lg text-xs font-medium transition-all',
                      task.priority === p ? 'ring-2 ring-[#44AADF]/50' : 'opacity-60 hover:opacity-100'
                    )}
                  >
                    <PriorityBadge priority={p} />
                  </button>
                ))}
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-[#999999] dark:text-[#6B6B6B] w-24 flex-shrink-0">Status</span>
              <div className="flex gap-1.5 flex-wrap">
                {statuses.map((s) => (
                  <button
                    key={s}
                    onClick={() => updateTask(task.id, { status: s })}
                    className={cn(
                      'px-2 py-1 rounded-lg text-xs font-medium transition-all',
                      task.status === s ? 'ring-2 ring-[#44AADF]/50' : 'opacity-60 hover:opacity-100'
                    )}
                  >
                    <StatusBadge status={s} />
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <p className="text-xs text-[#999999] dark:text-[#6B6B6B] mb-1.5">Description</p>
              <Textarea
                value={task.description}
                onChange={(e) => updateTask(task.id, { description: e.target.value })}
                placeholder="Add a description..."
                rows={4}
              />
            </div>

            {/* Tags */}
            <div>
              <p className="text-xs text-[#999999] dark:text-[#6B6B6B] mb-1.5">Tags</p>
              <TagInput
                tags={task.tags}
                onChange={(tags) => updateTask(task.id, { tags })}
              />
            </div>

            {/* Dependencies */}
            {task.dependsOnIds.length > 0 && (
              <div>
                <p className="text-xs text-[#999999] dark:text-[#6B6B6B] mb-1.5">Depends on</p>
                <div className="flex flex-wrap gap-1">
                  {task.dependsOnIds.map((id) => (
                    <span key={id} className="px-2 py-0.5 bg-black/5 dark:bg-white/5 text-[#555555] dark:text-[#A0A0A0] rounded text-xs">{id}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="pt-2 border-t border-[#E0E0E0] dark:border-white/10 space-y-1">
              <p className="text-xs text-[#999999] dark:text-[#6B6B6B]">Created {timeAgo(task.createdAt)}</p>
              <p className="text-xs text-[#999999] dark:text-[#6B6B6B]">Updated {timeAgo(task.updatedAt)}</p>
            </div>
          </>
        )}

        {activeTab === 'subtasks' && (
          <div>
            <div className="space-y-1 mb-3">
              {subtasks.length === 0 && (
                <p className="text-sm text-[#999999] dark:text-[#6B6B6B] text-center py-4">No subtasks yet</p>
              )}
              {subtasks.map((subtask) => subtask && (
                <TaskRow key={subtask.id} task={subtask} />
              ))}
            </div>

            {isAddingSubtask ? (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-black/5 dark:bg-white/5 rounded-lg border border-[#44AADF]/30">
                <input
                  autoFocus
                  type="text"
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddSubtask();
                    if (e.key === 'Escape') { setIsAddingSubtask(false); setNewSubtaskTitle(''); }
                  }}
                  placeholder="Subtask title..."
                  className="flex-1 bg-transparent text-sm text-[#111111] dark:text-white placeholder-[#999999] dark:placeholder-[#6B6B6B] outline-none"
                />
                <div className="flex items-center gap-1">
                  <button onClick={handleAddSubtask} className="px-2 py-0.5 bg-[#44AADF] text-white text-xs rounded">Add</button>
                  <button onClick={() => { setIsAddingSubtask(false); setNewSubtaskTitle(''); }} className="p-0.5 text-[#999999] dark:text-[#6B6B6B] hover:text-[#111111] dark:hover:text-white">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M9 3L3 9M3 3l6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingSubtask(true)}
                className="flex items-center gap-2 text-sm text-[#555555] dark:text-[#A0A0A0] hover:text-[#111111] dark:hover:text-white transition-colors py-1.5 px-3"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                Add subtask
              </button>
            )}
          </div>
        )}

        {activeTab === 'comments' && (
          <div>
            {/* Comment list */}
            <div className="space-y-4 mb-4">
              {comments.length === 0 && (
                <p className="text-sm text-[#999999] dark:text-[#6B6B6B] text-center py-4">No comments yet</p>
              )}
              {comments.map((comment) => {
                const author = allUsers.find((u) => u.id === comment.authorId);
                return (
                  <div key={comment.id} className="flex gap-3">
                    {author && <Avatar user={author} size="sm" className="flex-shrink-0 mt-0.5" />}
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-sm font-semibold text-[#111111] dark:text-white">{author?.name}</span>
                        <span className="text-xs text-[#999999] dark:text-[#6B6B6B]">{timeAgo(comment.createdAt)}</span>
                        {comment.isEdited && <span className="text-xs text-[#999999] dark:text-[#6B6B6B]">(edited)</span>}
                      </div>
                      <p className="text-sm text-[#333333] dark:text-[#D0D0D0] leading-relaxed">{comment.body}</p>
                      {/* Reactions */}
                      {Object.entries(comment.reactions).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {Object.entries(comment.reactions).map(([emoji, users]) => (
                            <span key={emoji} className="flex items-center gap-1 px-2 py-0.5 bg-black/5 dark:bg-white/5 rounded-full text-xs text-[#555555] dark:text-[#A0A0A0]">
                              {emoji} {users.length}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add comment */}
            <div className="border-t border-[#E0E0E0] dark:border-white/10 pt-4">
              <div className="flex gap-3">
                {currentUser && <Avatar user={currentUser} size="sm" className="flex-shrink-0 mt-1" />}
                <div className="flex-1">
                  <Textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment..."
                    rows={3}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAddComment();
                    }}
                  />
                  <div className="flex justify-end mt-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleAddComment}
                      disabled={!commentText.trim()}
                    >
                      Comment
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SlidePanel>
  );
};
