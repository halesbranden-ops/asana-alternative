# Changelog

All notable changes to BullFit are documented here.

---

## [Unreleased]

---

## [0.4.0] — 2026-04-02

### Added
- **Project edit modal** — Full project editing via a four-tab modal (General, Sections, Members, Danger)
  - General tab: name, description, 16-color swatch picker + custom hex input, status, start/due dates, privacy toggle
  - Sections tab: inline rename and delete, add new section
  - Members tab: role selector per member, remove member, add-member search
  - Danger tab: archive (soft) and delete (hard, with confirmation step)
- **Pencil edit button** in every project header to open the edit modal directly
- **`ProjectInitial` component** — Displays the first letter of a project name in a styled colored badge; used in project headers, sidebar, and search results

### Changed
- Replaced emoji project icons everywhere with `ProjectInitial` letter badges
- Search results for projects now show the `ProjectInitial` badge instead of a plain colored square

### Fixed
- **White screen on production load** — `useUserStore((s) => Object.values(s.users))` in `ProjectEditModal` and `useProjectStore(selectProjectSections(...))` were creating new array references on every Zustand snapshot check, triggering infinite re-render loops (React error #185 / "Maximum update depth exceeded"). Both selectors are now wrapped with `useShallow`.

---

## [0.3.0] — 2026-04-01

### Added
- **Global search** (`⌘K`) — searches tasks, events, projects, people, and settings pages
  - Fuzzy relevance scoring with highlighted query matches
  - Filter tabs: All, Tasks, Events, Projects, People, Pages
  - 15-item settings/navigation page catalogue
  - Recent searches persisted to localStorage
  - Dropdown animates directly below the header bar (flush, no separate popup border)
- **Light mode as default** — app now starts in light mode; preference persisted to localStorage
- **Theme toggle** in TopBar

### Fixed
- Logo broken in production — moved from `src/assets/` to `public/` so Vite doesn't hash the path at build time

---

## [0.2.0] — 2026-03-31

### Added
- Project status update modal
- Project create modal with color picker and privacy toggle
- `vercel.json` SPA rewrite rule for React Router client-side routing
- `.gitignore` excluding `node_modules`, `dist`, `.env`, `.vite`

### Fixed
- TypeScript error on `tailwind.config.cjs` import (`import type { Config }` + `allowJs: true` in tsconfig.node.json)

---

## [0.1.0] — 2026-03-30

### Added
- Initial commit: full BullFit work management app
- Projects, Tasks, Calendar, Inbox, Goals, Portfolios, Teams, Settings pages
- Zustand stores: `projectStore`, `taskStore`, `calendarStore`, `userStore`, `notificationStore`, `uiStore`, `searchStore`
- Sidebar with collapsible navigation
- Task detail side panel
- Board and list views per project
- Dark/light mode with Tailwind CSS `darkMode: 'class'`
- Deployed to Vercel at https://asana-alternative.vercel.app
