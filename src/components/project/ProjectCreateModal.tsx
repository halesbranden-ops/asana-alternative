import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { useUIStore } from '../../store/uiStore';
import { useProjectStore } from '../../store/projectStore';
import { useUserStore, selectCurrentUser } from '../../store/userStore';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { useNavigate } from 'react-router-dom';

const COLORS = ['#44AADF', '#8E4F9E', '#EC228D', '#FF6B35', '#FFD600', '#00BEFF', '#4CAF50', '#CF00FF', '#B1FF00', '#FF0087'];

export const ProjectCreateModal: React.FC = () => {
  const { isProjectCreateModalOpen, closeProjectCreate, addToast } = useUIStore() as any;
  const { createProject, createSection, addSectionToProject } = useProjectStore();
  const currentUser = useUserStore(selectCurrentUser);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    description: '',
    color: '#44AADF',
    isPrivate: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    const now = new Date().toISOString();
    const project = createProject({
      name: form.name.trim(),
      description: form.description,
      color: form.color,
      icon: '📋',
      status: 'on_track',
      ownerId: currentUser?.id || 'user-1',
      members: [{ userId: currentUser?.id || 'user-1', role: 'owner' }],
      sectionIds: [],
      customFields: [],
      startDate: null,
      dueDate: null,
      statusUpdates: [],
      teamId: null,
      isArchived: false,
      isPrivate: form.isPrivate,
    });

    // Create default sections
    const defaultSections = ['To Do', 'In Progress', 'Done'];
    defaultSections.forEach((name, i) => {
      const section = createSection({
        name,
        projectId: project.id,
        taskIds: [],
        isCollapsed: false,
        position: i,
      });
      addSectionToProject(project.id, section.id);
    });

    if (typeof addToast === 'function') {
      addToast({ type: 'success', message: `Project "${form.name}" created` });
    }
    closeProjectCreate();
    navigate(`/projects/${project.id}`);

    setForm({ name: '', description: '', color: '#44AADF', isPrivate: false });
  };

  return (
    <Modal isOpen={isProjectCreateModalOpen} onClose={closeProjectCreate} title="New Project" size="md">
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        <Input
          label="Project name *"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="e.g. Q2 Product Roadmap"
          autoFocus
        />

        <Textarea
          label="Description"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder="What is this project about?"
          rows={2}
        />

        {/* Color picker */}
        <div>
          <p className="text-xs font-medium text-[#555555] dark:text-[#A0A0A0] mb-2">Color</p>
          <div className="flex gap-2 flex-wrap">
            {COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setForm((f) => ({ ...f, color }))}
                className="w-8 h-8 rounded-lg transition-all hover:scale-110"
                style={{
                  backgroundColor: color,
                  outline: form.color === color ? '2px solid #44AADF' : 'none',
                  outlineOffset: '2px',
                }}
              />
            ))}
          </div>
        </div>

        {/* Privacy */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-[#555555] dark:text-[#A0A0A0]">Private project</span>
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, isPrivate: !f.isPrivate }))}
            className={`px-3 py-1 rounded-md text-xs font-medium border transition-colors duration-150 ${
              form.isPrivate
                ? 'bg-[#44AADF] border-[#44AADF] text-white'
                : 'bg-transparent border-[#D8D6D2] dark:border-white/20 text-[#555555] dark:text-[#A0A0A0] hover:border-[#44AADF] hover:text-[#44AADF]'
            }`}
          >
            {form.isPrivate ? 'On' : 'Off'}
          </button>
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-[#E0E0E0] dark:border-white/10">
          <Button type="button" variant="ghost" onClick={closeProjectCreate}>Cancel</Button>
          <Button type="submit" variant="primary" disabled={!form.name.trim()}>
            Create Project
          </Button>
        </div>
      </form>
    </Modal>
  );
};
