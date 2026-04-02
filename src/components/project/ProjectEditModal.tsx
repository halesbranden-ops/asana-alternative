import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';
import { useUIStore } from '../../store/uiStore';
import { useProjectStore, selectProject } from '../../store/projectStore';
import { useUserStore } from '../../store/userStore';
import { cn } from '../../utils/cn';
import { ProjectInitial } from './ProjectInitial';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { ProjectStatus, ProjectRole } from '../../types';

// ─── Constants ─────────────────────────────────────────────────────────────────

const COLORS = [
  '#44AADF', '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#EC4899',
  '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16', '#22C55E',
  '#10B981', '#14B8A6', '#06B6D4', '#64748B',
];

const STATUS_OPTIONS: { value: ProjectStatus; label: string; color: string }[] = [
  { value: 'on_track',  label: 'On Track',  color: '#22C55E' },
  { value: 'at_risk',   label: 'At Risk',   color: '#F97316' },
  { value: 'off_track', label: 'Off Track', color: '#EF4444' },
  { value: 'on_hold',   label: 'On Hold',   color: '#6B7280' },
  { value: 'complete',  label: 'Complete',  color: '#44AADF' },
];

const ROLE_OPTIONS: { value: ProjectRole; label: string }[] = [
  { value: 'owner',     label: 'Owner'     },
  { value: 'editor',    label: 'Editor'    },
  { value: 'commenter', label: 'Commenter' },
  { value: 'viewer',    label: 'Viewer'    },
];

type Tab = 'general' | 'sections' | 'members' | 'danger';

// ─── Main component ─────────────────────────────────────────────────────────────

export const ProjectEditModal: React.FC = () => {
  const { isProjectEditModalOpen, projectEditId, closeProjectEdit, addToast } = useUIStore() as any;
  const project = useProjectStore(selectProject(projectEditId || ''));
  const storeSections = useProjectStore(
    useShallow((state) => {
      const proj = state.projects[projectEditId || ''];
      if (!proj) return [] as import('../../types').Section[];
      return proj.sectionIds.map((id) => state.sections[id]).filter(Boolean) as import('../../types').Section[];
    })
  );
  const { updateProject, deleteProject, archiveProject, createSection, addSectionToProject, updateSection, deleteSection, removeMember, addMember } = useProjectStore();
  const allUsers = useUserStore((s) => Object.values(s.users));
  const navigate = useNavigate();

  const [tab, setTab] = useState<Tab>('general');
  const [form, setForm] = useState({ name: '', description: '', color: '#44AADF', status: 'on_track' as ProjectStatus, startDate: '', dueDate: '', isPrivate: false });
  const [sections, setSections] = useState<{ id: string; name: string; isNew?: boolean }[]>([]);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingSectionName, setEditingSectionName] = useState('');
  const [newSectionName, setNewSectionName] = useState('');
  const [addingSection, setAddingSection] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, setSaving] = useState(false);
  const [customColor, setCustomColor] = useState('');

  // Sync form from project when modal opens
  useEffect(() => {
    if (isProjectEditModalOpen && project) {
      setForm({
        name: project.name,
        description: project.description,
        color: project.color,
        status: project.status,
        startDate: project.startDate || '',
        dueDate: project.dueDate || '',
        isPrivate: project.isPrivate,
      });
      setSections(storeSections.map((s) => ({ id: s.id, name: s.name })));
      setTab('general');
      setConfirmDelete(false);
      setEditingSectionId(null);
      setMemberSearch('');
      setCustomColor('');
    }
  }, [isProjectEditModalOpen, projectEditId]); // eslint-disable-line

  if (!isProjectEditModalOpen || !project) return null;

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleSaveGeneral = () => {
    if (!form.name.trim()) return;
    setSaving(true);
    updateProject(project.id, {
      name: form.name.trim(),
      description: form.description,
      color: form.color,
      status: form.status,
      startDate: form.startDate || null,
      dueDate: form.dueDate || null,
      isPrivate: form.isPrivate,
    });
    (addToast as any)?.({ type: 'success', message: 'Project updated' });
    setSaving(false);
    closeProjectEdit();
  };

  const startEditSection = (id: string, name: string) => {
    setEditingSectionId(id);
    setEditingSectionName(name);
  };

  const saveEditSection = (id: string) => {
    if (editingSectionName.trim()) {
      updateSection(id, { name: editingSectionName.trim() });
      setSections((prev) => prev.map((s) => s.id === id ? { ...s, name: editingSectionName.trim() } : s));
    }
    setEditingSectionId(null);
  };

  const handleDeleteSection = (id: string) => {
    deleteSection(id);
    setSections((prev) => prev.filter((s) => s.id !== id));
  };

  const handleAddSection = () => {
    if (!newSectionName.trim()) return;
    const section = createSection({ name: newSectionName.trim(), projectId: project.id, taskIds: [], isCollapsed: false, position: sections.length });
    addSectionToProject(project.id, section.id);
    setSections((prev) => [...prev, { id: section.id, name: newSectionName.trim() }]);
    setNewSectionName('');
    setAddingSection(false);
  };

  const handleRemoveMember = (userId: string) => {
    if (project.members.length <= 1) return; // keep at least one
    removeMember(project.id, userId);
    (addToast as any)?.({ type: 'info', message: 'Member removed' });
  };

  const handleAddMember = (userId: string) => {
    const alreadyMember = project.members.some((m) => m.userId === userId);
    if (alreadyMember) return;
    addMember(project.id, { userId, role: 'editor' });
    setMemberSearch('');
    (addToast as any)?.({ type: 'success', message: 'Member added' });
  };

  const handleChangeRole = (userId: string, role: ProjectRole) => {
    const member = project.members.find((m) => m.userId === userId);
    if (!member) return;
    removeMember(project.id, userId);
    addMember(project.id, { userId, role });
  };

  const handleArchive = () => {
    archiveProject(project.id);
    (addToast as any)?.({ type: 'info', message: 'Project archived' });
    closeProjectEdit();
    navigate('/');
  };

  const handleDelete = () => {
    deleteProject(project.id);
    (addToast as any)?.({ type: 'info', message: 'Project deleted' });
    closeProjectEdit();
    navigate('/');
  };

  const filteredUsers = allUsers.filter((u) =>
    u.name.toLowerCase().includes(memberSearch.toLowerCase()) &&
    !project.members.some((m) => m.userId === u.id)
  );

  const memberUsers = project.members.map((m) => ({ ...m, user: allUsers.find((u) => u.id === m.userId) })).filter((m) => m.user);

  // ── UI ───────────────────────────────────────────────────────────────────────

  const TABS: { id: Tab; label: string }[] = [
    { id: 'general',  label: 'General'  },
    { id: 'sections', label: 'Sections' },
    { id: 'members',  label: 'Members'  },
    { id: 'danger',   label: 'Danger'   },
  ];

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" onClick={closeProjectEdit} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#2A2A2A] rounded-2xl shadow-panel border border-[#E0E0E0] dark:border-white/10 flex flex-col max-h-[90vh] animate-scale-in overflow-hidden">

        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[#E0E0E0] dark:border-white/10 flex-shrink-0">
          <ProjectInitial name={form.name || project.name} color={form.color} size={36} />
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-[#111111] dark:text-white truncate">{form.name || project.name}</h2>
            <p className="text-xs text-[#999999] dark:text-[#6B6B6B]">Edit project settings</p>
          </div>
          <button onClick={closeProjectEdit} className="p-2 rounded-lg text-[#999999] hover:text-[#111111] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 2l12 12M14 2L2 14" strokeLinecap="round"/></svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-4 pt-3 border-b border-[#E0E0E0] dark:border-white/10 flex-shrink-0">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={cn('px-3 py-2 text-sm font-medium rounded-t-lg transition-all border-b-2 -mb-px',
                tab === t.id
                  ? t.id === 'danger'
                    ? 'text-red-500 border-red-500'
                    : 'text-[#44AADF] border-[#44AADF]'
                  : 'text-[#888888] dark:text-[#666666] border-transparent hover:text-[#111111] dark:hover:text-white'
              )}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* ── GENERAL TAB ── */}
          {tab === 'general' && (
            <>
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-[#555555] dark:text-[#A0A0A0] mb-1.5 uppercase tracking-wide">Project Name</label>
                <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Project name"
                  className="w-full px-3 py-2 rounded-lg border border-[#E0E0E0] dark:border-white/10 bg-white dark:bg-[#333333] text-sm text-[#111111] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#44AADF]/40 focus:border-[#44AADF]/60 transition-all" />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-[#555555] dark:text-[#A0A0A0] mb-1.5 uppercase tracking-wide">Description</label>
                <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="What is this project about?"
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-[#E0E0E0] dark:border-white/10 bg-white dark:bg-[#333333] text-sm text-[#111111] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#44AADF]/40 focus:border-[#44AADF]/60 transition-all resize-none" />
              </div>

              {/* Color */}
              <div>
                <label className="block text-xs font-semibold text-[#555555] dark:text-[#A0A0A0] mb-2 uppercase tracking-wide">Color</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {COLORS.map((c) => (
                    <button key={c} type="button" onClick={() => setForm((f) => ({ ...f, color: c }))}
                      className="w-8 h-8 rounded-lg transition-all hover:scale-110 flex-shrink-0"
                      style={{ backgroundColor: c, outline: form.color === c ? `3px solid ${c}` : '2px solid transparent', outlineOffset: '2px' }} />
                  ))}
                </div>
                {/* Custom hex */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex-shrink-0 border border-[#E0E0E0] dark:border-white/10" style={{ backgroundColor: form.color }} />
                  <input
                    value={customColor || form.color}
                    onChange={(e) => {
                      setCustomColor(e.target.value);
                      if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                        setForm((f) => ({ ...f, color: e.target.value }));
                      }
                    }}
                    placeholder="#44AADF"
                    className="w-32 px-2 py-1.5 rounded-lg border border-[#E0E0E0] dark:border-white/10 bg-white dark:bg-[#333333] text-sm text-[#111111] dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-[#44AADF]/40 transition-all"
                  />
                  <span className="text-xs text-[#999999] dark:text-[#6B6B6B]">Custom hex color</span>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-[#555555] dark:text-[#A0A0A0] mb-2 uppercase tracking-wide">Status</label>
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map((s) => (
                    <button key={s.value} type="button" onClick={() => setForm((f) => ({ ...f, status: s.value }))}
                      className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                        form.status === s.value
                          ? 'text-white border-transparent'
                          : 'border-[#E0E0E0] dark:border-white/10 text-[#555555] dark:text-[#A0A0A0] hover:border-current'
                      )}
                      style={form.status === s.value ? { backgroundColor: s.color, borderColor: s.color } : undefined}>
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: form.status === s.value ? 'white' : s.color }} />
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#555555] dark:text-[#A0A0A0] mb-1.5 uppercase tracking-wide">Start Date</label>
                  <input type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-[#E0E0E0] dark:border-white/10 bg-white dark:bg-[#333333] text-sm text-[#111111] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#44AADF]/40 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#555555] dark:text-[#A0A0A0] mb-1.5 uppercase tracking-wide">Due Date</label>
                  <input type="date" value={form.dueDate} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-[#E0E0E0] dark:border-white/10 bg-white dark:bg-[#333333] text-sm text-[#111111] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#44AADF]/40 transition-all" />
                </div>
              </div>

              {/* Privacy */}
              <div className="flex items-center justify-between py-3 px-4 bg-black/[0.02] dark:bg-white/[0.03] rounded-xl border border-[#E8E8E8] dark:border-white/[0.06]">
                <div>
                  <p className="text-sm font-medium text-[#111111] dark:text-white">Private Project</p>
                  <p className="text-xs text-[#999999] dark:text-[#6B6B6B] mt-0.5">Only members can see this project</p>
                </div>
                <button type="button" onClick={() => setForm((f) => ({ ...f, isPrivate: !f.isPrivate }))}
                  className={cn('relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0', form.isPrivate ? 'bg-[#44AADF]' : 'bg-[#D0D0D0] dark:bg-[#444444]')}>
                  <span className={cn('absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200', form.isPrivate ? 'left-6' : 'left-1')} />
                </button>
              </div>
            </>
          )}

          {/* ── SECTIONS TAB ── */}
          {tab === 'sections' && (
            <div>
              <p className="text-xs text-[#999999] dark:text-[#6B6B6B] mb-4">Sections organize tasks within the project. Deleting a section does not delete its tasks.</p>
              <div className="space-y-2">
                {sections.map((section) => (
                  <div key={section.id} className="flex items-center gap-2 group">
                    {editingSectionId === section.id ? (
                      <>
                        <input
                          autoFocus
                          value={editingSectionName}
                          onChange={(e) => setEditingSectionName(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') saveEditSection(section.id); if (e.key === 'Escape') setEditingSectionId(null); }}
                          className="flex-1 px-3 py-1.5 rounded-lg border border-[#44AADF]/50 bg-white dark:bg-[#333333] text-sm text-[#111111] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#44AADF]/30 transition-all"
                        />
                        <Button size="sm" variant="primary" onClick={() => saveEditSection(section.id)}>Save</Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingSectionId(null)}>Cancel</Button>
                      </>
                    ) : (
                      <>
                        <div className="flex-1 px-3 py-2 rounded-lg bg-black/[0.02] dark:bg-white/[0.03] border border-[#E8E8E8] dark:border-white/[0.06] text-sm text-[#111111] dark:text-white">
                          {section.name}
                        </div>
                        <button onClick={() => startEditSection(section.id, section.name)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-[#999999] hover:text-[#44AADF] hover:bg-[#44AADF]/10 transition-all">
                          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z" strokeLinejoin="round"/></svg>
                        </button>
                        <button onClick={() => handleDeleteSection(section.id)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-[#999999] hover:text-red-500 hover:bg-red-500/10 transition-all">
                          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M2 4h10M5 4V2.5h4V4M5.5 7v4M8.5 7v4M3 4l1 8h6l1-8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* Add section */}
              {addingSection ? (
                <div className="flex items-center gap-2 mt-3">
                  <input autoFocus value={newSectionName} onChange={(e) => setNewSectionName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddSection(); if (e.key === 'Escape') setAddingSection(false); }}
                    placeholder="Section name"
                    className="flex-1 px-3 py-1.5 rounded-lg border border-[#44AADF]/50 bg-white dark:bg-[#333333] text-sm text-[#111111] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#44AADF]/30 transition-all" />
                  <Button size="sm" variant="primary" onClick={handleAddSection} disabled={!newSectionName.trim()}>Add</Button>
                  <Button size="sm" variant="ghost" onClick={() => { setAddingSection(false); setNewSectionName(''); }}>Cancel</Button>
                </div>
              ) : (
                <button onClick={() => setAddingSection(true)}
                  className="mt-3 flex items-center gap-2 text-sm text-[#44AADF] hover:text-[#3399CE] font-medium transition-colors">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M7 1v12M1 7h12" strokeLinecap="round"/></svg>
                  Add Section
                </button>
              )}
            </div>
          )}

          {/* ── MEMBERS TAB ── */}
          {tab === 'members' && (
            <div>
              <p className="text-xs text-[#999999] dark:text-[#6B6B6B] mb-4">Manage who has access to this project and their roles.</p>

              {/* Current members */}
              <div className="space-y-2 mb-5">
                {memberUsers.map(({ userId, role, user }) => user && (
                  <div key={userId} className="flex items-center gap-3 py-2 px-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-[#E8E8E8] dark:border-white/[0.06]">
                    <Avatar user={user} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#111111] dark:text-white truncate">{user.name}</p>
                      <p className="text-xs text-[#999999] dark:text-[#6B6B6B] truncate">{user.email || user.role}</p>
                    </div>
                    {/* Role selector */}
                    <select
                      value={role}
                      onChange={(e) => handleChangeRole(userId, e.target.value as ProjectRole)}
                      className="text-xs px-2 py-1 rounded-lg border border-[#E0E0E0] dark:border-white/10 bg-white dark:bg-[#333333] text-[#555555] dark:text-[#A0A0A0] focus:outline-none focus:ring-1 focus:ring-[#44AADF]/40 cursor-pointer"
                    >
                      {ROLE_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                    {/* Remove — can't remove last member */}
                    {project.members.length > 1 && (
                      <button onClick={() => handleRemoveMember(userId)}
                        className="p-1 rounded-lg text-[#CCCCCC] dark:text-[#444444] hover:text-red-500 hover:bg-red-500/10 transition-all">
                        <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 2l10 10M12 2L2 12" strokeLinecap="round"/></svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Add member search */}
              <div>
                <label className="block text-xs font-semibold text-[#555555] dark:text-[#A0A0A0] mb-2 uppercase tracking-wide">Add Member</label>
                <input
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  placeholder="Search people..."
                  className="w-full px-3 py-2 rounded-lg border border-[#E0E0E0] dark:border-white/10 bg-white dark:bg-[#333333] text-sm text-[#111111] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#44AADF]/40 transition-all mb-2"
                />
                {memberSearch && (
                  <div className="rounded-xl border border-[#E0E0E0] dark:border-white/10 overflow-hidden">
                    {filteredUsers.length === 0 ? (
                      <p className="px-4 py-3 text-sm text-[#999999] dark:text-[#6B6B6B]">No users found</p>
                    ) : filteredUsers.slice(0, 5).map((u) => (
                      <button key={u.id} onClick={() => handleAddMember(u.id)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#44AADF]/5 transition-colors text-left">
                        <Avatar user={u} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#111111] dark:text-white truncate">{u.name}</p>
                          <p className="text-xs text-[#999999] dark:text-[#6B6B6B]">{u.role}</p>
                        </div>
                        <span className="text-xs text-[#44AADF]">+ Add</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── DANGER TAB ── */}
          {tab === 'danger' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-[#FCA5A5] dark:border-red-500/30 bg-red-50 dark:bg-red-500/5">
                <h3 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-1">Archive Project</h3>
                <p className="text-xs text-red-600 dark:text-red-400/80 mb-3">Archiving hides the project from the sidebar and lists but keeps all data.</p>
                <Button variant="danger" size="sm" onClick={handleArchive}>Archive Project</Button>
              </div>

              <div className="p-4 rounded-xl border border-[#FCA5A5] dark:border-red-500/30 bg-red-50 dark:bg-red-500/5">
                <h3 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-1">Delete Project</h3>
                <p className="text-xs text-red-600 dark:text-red-400/80 mb-3">This permanently deletes the project and all its tasks. This cannot be undone.</p>
                {!confirmDelete ? (
                  <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)}>Delete Project</Button>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-red-600 dark:text-red-400">Are you sure?</span>
                    <Button variant="danger" size="sm" onClick={handleDelete}>Yes, Delete</Button>
                    <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>Cancel</Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions — only on general tab */}
        {tab === 'general' && (
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#E0E0E0] dark:border-white/10 flex-shrink-0">
            <Button variant="ghost" onClick={closeProjectEdit}>Cancel</Button>
            <Button variant="primary" onClick={handleSaveGeneral} disabled={!form.name.trim() || saving}>
              Save Changes
            </Button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
