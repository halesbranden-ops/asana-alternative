import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { useShallow } from 'zustand/react/shallow';
import { useUIStore } from '../../store/uiStore';
import { useTaskStore } from '../../store/taskStore';
import { useProjectStore } from '../../store/projectStore';
import { useUserStore, selectCurrentUser } from '../../store/userStore';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { DatePicker } from '../ui/DatePicker';
import { TagInput } from '../ui/TagInput';
import { Button } from '../ui/Button';
import { Priority, TaskStatus } from '../../types';

export const TaskCreateModal: React.FC = () => {
  const { isTaskCreateModalOpen, closeTaskCreate, taskCreateProjectId, taskCreateSectionId, addToast } = useUIStore() as any;
  const { createTask } = useTaskStore();
  const { addTaskToSection } = useProjectStore();
  const projects = useProjectStore(useShallow((s) => Object.values(s.projects).filter((p) => !p.isArchived)));
  const allUsers = useUserStore(useShallow((s) => Object.values(s.users)));
  const currentUser = useUserStore(selectCurrentUser);

  const [form, setForm] = useState({
    title: '',
    description: '',
    projectId: taskCreateProjectId || (projects[0]?.id ?? ''),
    assigneeId: '',
    priority: 'none' as Priority,
    status: 'todo' as TaskStatus,
    dueDate: null as string | null,
    startDate: null as string | null,
    tags: [] as string[],
  });

  // Update projectId when modal opens
  React.useEffect(() => {
    if (isTaskCreateModalOpen) {
      setForm((f) => ({
        ...f,
        projectId: taskCreateProjectId || projects[0]?.id || '',
        title: '',
        description: '',
      }));
    }
  }, [isTaskCreateModalOpen, taskCreateProjectId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    const project = projects.find((p) => p.id === form.projectId);
    const sectionId = taskCreateSectionId || project?.sectionIds[0] || '';

    const task = createTask({
      title: form.title.trim(),
      description: form.description,
      projectId: form.projectId,
      sectionId,
      parentTaskId: null,
      subtaskIds: [],
      dependsOnIds: [],
      blockingIds: [],
      assigneeId: form.assigneeId || null,
      followerIds: [],
      status: form.status,
      priority: form.priority,
      tags: form.tags,
      customFields: {},
      dueDate: form.dueDate,
      startDate: form.startDate,
      completedAt: null,
      createdById: currentUser?.id || 'user-1',
      commentIds: [],
      attachments: [],
      isArchived: false,
      position: 999,
      columnId: 'todo',
    });

    if (sectionId) {
      addTaskToSection(sectionId, task.id);
    }

    if (typeof addToast === 'function') {
      addToast({ type: 'success', message: `Task "${form.title}" created` });
    }
    closeTaskCreate();
  };

  const priorityOptions = [
    { value: 'urgent', label: 'Urgent' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
    { value: 'none', label: 'None' },
  ];

  const statusOptions = [
    { value: 'todo', label: 'To Do' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'in_review', label: 'In Review' },
    { value: 'done', label: 'Done' },
    { value: 'blocked', label: 'Blocked' },
  ];

  return (
    <Modal isOpen={isTaskCreateModalOpen} onClose={closeTaskCreate} title="Create Task" size="xl">
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        <Input
          label="Task title *"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          placeholder="What needs to be done?"
          autoFocus
        />

        <Textarea
          label="Description"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder="Add more details..."
          rows={3}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Project"
            value={form.projectId}
            onChange={(e) => setForm((f) => ({ ...f, projectId: e.target.value }))}
            options={projects.map((p) => ({ value: p.id, label: p.name }))}
          />
          <Select
            label="Assignee"
            value={form.assigneeId}
            onChange={(e) => setForm((f) => ({ ...f, assigneeId: e.target.value }))}
            options={allUsers.map((u) => ({ value: u.id, label: u.name }))}
            placeholder="Unassigned"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Priority"
            value={form.priority}
            onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as Priority }))}
            options={priorityOptions}
          />
          <Select
            label="Status"
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as TaskStatus }))}
            options={statusOptions}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium text-[#555555] dark:text-[#A0A0A0] mb-1">Due date</p>
            <DatePicker
              value={form.dueDate}
              onChange={(date) => setForm((f) => ({ ...f, dueDate: date }))}
              className="w-full"
            />
          </div>
          <div>
            <p className="text-xs font-medium text-[#555555] dark:text-[#A0A0A0] mb-1">Start date</p>
            <DatePicker
              value={form.startDate}
              onChange={(date) => setForm((f) => ({ ...f, startDate: date }))}
              placeholder="Set start date"
              className="w-full"
            />
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-[#555555] dark:text-[#A0A0A0] mb-1">Tags</p>
          <TagInput
            tags={form.tags}
            onChange={(tags) => setForm((f) => ({ ...f, tags }))}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-[#E0E0E0] dark:border-white/10">
          <Button type="button" variant="ghost" onClick={closeTaskCreate}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={!form.title.trim()}>
            Create Task
          </Button>
        </div>
      </form>
    </Modal>
  );
};
