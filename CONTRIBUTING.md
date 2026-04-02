# Contributing to BullFit

Thanks for your interest in contributing!

---

## Development Setup

```bash
# Clone the repo
git clone https://github.com/halesbranden-ops/asana-alternative.git
cd asana-alternative

# Install dependencies
npm install

# Start dev server (http://localhost:5173)
npm run dev
```

---

## Rules for Zustand Selectors

This project uses React 19 + Zustand v5. React 19's `useSyncExternalStore` is stricter about snapshot stability — **always wrap selectors that return arrays or objects with `useShallow`**:

```ts
// Bad — creates a new array reference every render, causes infinite loop
const tasks = useTaskStore((s) => Object.values(s.tasks));

// Good
import { useShallow } from 'zustand/react/shallow';
const tasks = useTaskStore(useShallow((s) => Object.values(s.tasks)));
```

This applies to any selector using `.map()`, `.filter()`, `Object.values()`, or object literals.

---

## Branching

| Branch | Purpose |
|---|---|
| `master` | Production — deployed to Vercel automatically |
| `feature/*` | New features |
| `fix/*` | Bug fixes |

---

## Commit Style

Use a short imperative subject line, e.g.:

```
Add project edit modal with General/Sections/Members/Danger tabs
Fix infinite loop: wrap allUsers selector with useShallow
Update ProjectHeader to use ProjectInitial instead of emoji
```

---

## Adding a New Page

1. Create `src/pages/YourPage.tsx`
2. Add a route in `src/App.tsx` (or wherever routes are defined)
3. Add a `NavItem` entry in `src/components/layout/Sidebar.tsx`
4. Add the page to the `PAGE_CATALOGUE` array in `src/components/search/GlobalSearchModal.tsx` so it appears in search results

---

## Styling

- Tailwind CSS v3 with `darkMode: 'class'`
- The root `<html>` element gets the `dark` class when dark mode is active (managed by `uiStore`)
- Use `dark:` variants for all color tokens; avoid hardcoded colors where possible
- Design tokens: `#111111` (text), `#555555` (secondary), `#44AADF` (accent blue), `#E0E0E0` (border light)
