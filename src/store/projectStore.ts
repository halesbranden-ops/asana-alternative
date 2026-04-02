import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { Project, Section, ProjectMember, StatusUpdate, ProjectStatus } from '../types';
import { generateId } from '../utils/id.utils';

interface ProjectState {
  projects: Record<string, Project>;
  sections: Record<string, Section>;
}

interface ProjectActions {
  seedProjects: (projects: Project[], sections: Section[]) => void;
  createProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  archiveProject: (id: string) => void;
  addMember: (projectId: string, member: ProjectMember) => void;
  removeMember: (projectId: string, userId: string) => void;
  postStatusUpdate: (projectId: string, update: Omit<StatusUpdate, 'id'>) => void;
  createSection: (section: Omit<Section, 'id'>) => Section;
  updateSection: (id: string, updates: Partial<Section>) => void;
  deleteSection: (id: string) => void;
  toggleSectionCollapse: (id: string) => void;
  addTaskToSection: (sectionId: string, taskId: string) => void;
  removeTaskFromSection: (sectionId: string, taskId: string) => void;
  reorderSectionTasks: (sectionId: string, taskIds: string[]) => void;
  addSectionToProject: (projectId: string, sectionId: string) => void;
  updateProjectStatus: (projectId: string, status: ProjectStatus) => void;
}

type ProjectStore = ProjectState & ProjectActions;

export const useProjectStore = create<ProjectStore>()(
  persist(
    immer((set) => ({
      projects: {},
      sections: {},

      seedProjects: (projects, sections) =>
        set((state) => {
          projects.forEach((p) => {
            state.projects[p.id] = p;
          });
          sections.forEach((s) => {
            state.sections[s.id] = s;
          });
        }),

      createProject: (projectData) => {
        const now = new Date().toISOString();
        const newProject: Project = {
          ...projectData,
          id: generateId('project'),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => {
          state.projects[newProject.id] = newProject;
        });
        return newProject;
      },

      updateProject: (id, updates) =>
        set((state) => {
          if (state.projects[id]) {
            Object.assign(state.projects[id], { ...updates, updatedAt: new Date().toISOString() });
          }
        }),

      deleteProject: (id) =>
        set((state) => {
          delete state.projects[id];
        }),

      archiveProject: (id) =>
        set((state) => {
          if (state.projects[id]) {
            state.projects[id].isArchived = true;
          }
        }),

      addMember: (projectId, member) =>
        set((state) => {
          if (state.projects[projectId]) {
            const existing = state.projects[projectId].members.find((m) => m.userId === member.userId);
            if (!existing) {
              state.projects[projectId].members.push(member);
            }
          }
        }),

      removeMember: (projectId, userId) =>
        set((state) => {
          if (state.projects[projectId]) {
            state.projects[projectId].members = state.projects[projectId].members.filter(
              (m) => m.userId !== userId
            );
          }
        }),

      postStatusUpdate: (projectId, update) =>
        set((state) => {
          if (state.projects[projectId]) {
            const newUpdate: StatusUpdate = {
              ...update,
              id: generateId('su'),
            };
            state.projects[projectId].statusUpdates.unshift(newUpdate);
            state.projects[projectId].status = update.status;
            state.projects[projectId].updatedAt = new Date().toISOString();
          }
        }),

      createSection: (sectionData) => {
        const newSection: Section = {
          ...sectionData,
          id: generateId('section'),
        };
        set((state) => {
          state.sections[newSection.id] = newSection;
        });
        return newSection;
      },

      updateSection: (id, updates) =>
        set((state) => {
          if (state.sections[id]) {
            Object.assign(state.sections[id], updates);
          }
        }),

      deleteSection: (id) =>
        set((state) => {
          const section = state.sections[id];
          if (!section) return;
          if (state.projects[section.projectId]) {
            state.projects[section.projectId].sectionIds = state.projects[section.projectId].sectionIds.filter(
              (sid) => sid !== id
            );
          }
          delete state.sections[id];
        }),

      toggleSectionCollapse: (id) =>
        set((state) => {
          if (state.sections[id]) {
            state.sections[id].isCollapsed = !state.sections[id].isCollapsed;
          }
        }),

      addTaskToSection: (sectionId, taskId) =>
        set((state) => {
          if (state.sections[sectionId] && !state.sections[sectionId].taskIds.includes(taskId)) {
            state.sections[sectionId].taskIds.push(taskId);
          }
        }),

      removeTaskFromSection: (sectionId, taskId) =>
        set((state) => {
          if (state.sections[sectionId]) {
            state.sections[sectionId].taskIds = state.sections[sectionId].taskIds.filter(
              (tid) => tid !== taskId
            );
          }
        }),

      reorderSectionTasks: (sectionId, taskIds) =>
        set((state) => {
          if (state.sections[sectionId]) {
            state.sections[sectionId].taskIds = taskIds;
          }
        }),

      addSectionToProject: (projectId, sectionId) =>
        set((state) => {
          if (state.projects[projectId] && !state.projects[projectId].sectionIds.includes(sectionId)) {
            state.projects[projectId].sectionIds.push(sectionId);
          }
        }),

      updateProjectStatus: (projectId, status) =>
        set((state) => {
          if (state.projects[projectId]) {
            state.projects[projectId].status = status;
            state.projects[projectId].updatedAt = new Date().toISOString();
          }
        }),
    })),
    {
      name: 'bullfit-projects-v2',
    }
  )
);

// Selectors
export const selectProject = (id: string) => (state: ProjectStore) => state.projects[id];
export const selectSection = (id: string) => (state: ProjectStore) => state.sections[id];
export const selectProjectSections = (projectId: string) => (state: ProjectStore) => {
  const project = state.projects[projectId];
  if (!project) return [] as import('../types').Section[];
  return project.sectionIds.map((id) => state.sections[id]).filter(Boolean) as import('../types').Section[];
};
export const selectAllProjects = (state: ProjectStore) =>
  Object.values(state.projects).filter((p) => !p.isArchived);
