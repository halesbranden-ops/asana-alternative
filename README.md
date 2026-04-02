# BullFit — Work Management

A full-featured project and task management app built as a modern alternative to Asana. Built with React 19, TypeScript, Vite, Tailwind CSS, and Zustand.

**Live demo:** https://asana-alternative.vercel.app

---

## Features

### Projects
- Create projects with a name, description, color, and privacy setting
- Project header displays the first letter of the project name as a styled initial badge
- Edit every aspect of a project via the edit modal (General, Sections, Members, Danger tabs)
- Archive or permanently delete projects
- Per-project status: On Track, At Risk, Off Track, On Hold, Complete

### Tasks
- Create, edit, and complete tasks with title, description, priority, due date, assignee, and tags
- Drag-and-drop board view and list view per project
- Task detail side panel with full editing
- My Tasks page shows all tasks assigned to the current user
- Calendar view for tasks and events

### Search
- Global search bar (`⌘K`) searches tasks, events, projects, people, and settings pages
- Fuzzy relevance scoring with highlighted matches
- Filter tabs (All / Tasks / Events / Projects / People / Pages)
- Recent searches persisted to localStorage
- Dropdown animates directly below the header, flush with the content area

### Calendar & Events
- Monthly and weekly calendar views
- Create meetings, reminders, deadlines, and other events with color coding

### Inbox & Notifications
- Activity feed for project and task updates
- Unread badge count in the sidebar

### Goals & Portfolios
- Track OKRs and goals with progress indicators
- Group related projects into portfolios

### Teams
- Team pages with member listings and roles

### Settings
- Profile editing (name, avatar, role)
- Appearance: light / dark mode toggle, persisted to localStorage
- Notification preferences, security, integrations, and billing placeholders

---

## Tech Stack

| Layer | Library |
|---|---|
| UI Framework | React 19 |
| Language | TypeScript |
| Build Tool | Vite 8 |
| Styling | Tailwind CSS v3 (class-based dark mode) |
| State Management | Zustand v5 |
| Routing | React Router v7 |
| Date Utilities | date-fns |
| Deployment | Vercel |

---

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Type check
npx tsc --noEmit

# Production build
npm run build

# Preview production build locally
npm run preview
```

---

## Project Structure

```
src/
  components/
    layout/        # AppShell, Sidebar, TopBar
    project/       # ProjectHeader, ProjectEditModal, ProjectInitial, ProjectCreateModal
    task/          # TaskDetailPanel, TaskCreateModal, TaskCard, PriorityIcon
    search/        # GlobalSearchModal
    calendar/      # CalendarView, CalendarEventModal
    dashboard/     # StatsWidget, ProjectStatusSummary
    ui/            # Avatar, Badge, Button, Input, Modal, Tooltip, Toast, ...
  pages/           # HomePage, ProjectPage, MyTasksPage, CalendarPage, InboxPage, ...
  store/           # Zustand stores: projectStore, taskStore, uiStore, userStore, ...
  types/           # Shared TypeScript interfaces
  utils/           # cn, date.utils, searchBarRef
  styles/          # index.css (Tailwind + custom keyframe animations)
```

---

## Key Design Decisions

- **Project initials instead of emoji** — Projects display their first letter in a colored badge rather than an emoji icon, keeping the UI clean and consistent.
- **`useShallow` on all array selectors** — Zustand selectors that return arrays (via `Object.values`, `map`, or `filter`) are wrapped with `useShallow` to prevent infinite re-render loops from unstable snapshot references in React 19's `useSyncExternalStore`.
- **`searchBarRef` module-level ref** — A shared mutable ref connects the TopBar search button to the GlobalSearchModal so the dropdown can be precisely anchored below the header using `getBoundingClientRect()`.
- **`createPortal` for overlays** — All modals and the search dropdown render into `document.body` to avoid z-index and overflow clipping issues.

---

## Deployment

The app is deployed on Vercel. A `vercel.json` SPA rewrite rule redirects all routes to `index.html` so React Router handles navigation client-side.

```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

Static assets (logo, favicon) live in `public/` so they are accessible at their root path in production builds.
