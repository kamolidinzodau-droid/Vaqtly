# Project memory

## Product intent & audience

- Personal productivity app: schedule/tasks, habits, notes, timer, stats, premium upgrade, and auth.
- Audience: individual users seeking an all-in-one daily productivity tool.
- Sign-in is demo-only (accepts any credentials); no real backend auth wired yet.

## Brand personality & voice

- Direct, utilitarian tone; minimal copy.
- Footer uses simple attribution text.

## Visual design & UX direction

- Tailwind CSS with custom config: `accent` color token and custom animation classes defined in `tailwind.config` and `index.css`.
- Theme support via `useTheme` hook (light/dark).
- Component inventory: `Header`, `AuthModal`, `AddTaskForm`, four views (habits, notes, timer, stats), and shared hooks/lib.
- Responsive and accessibility specifics not yet verified.

## Decisions, constraints & rationale

- App source lives exclusively in `project/`; root-level `src/` and `supabase/` folders are a separate, unused codebase and should not be imported by the app.
- `App.tsx` was repaired to pass required `Header` props (`user`, `onOpenAuth`, `onLogout`), wire premium state to `storage.ts`, and render `AuthModal`.
- Replaced hand-written auth logic in `App.tsx` with existing `useAuth` hook to avoid duplication.
- Fixed mojibake characters (garbled dashes) in `App.tsx` footer and `AddTaskForm.tsx` comment.
- Dependencies installed; `tsc` type check and Vite production build both pass.

## Open questions & assumptions

- Feature screens (habits, notes, timer, stats) exist but are not reachable from the main page navigation yet.
- Root-level `src/` and `supabase/` folders: unclear if they should be removed or integrated later.
- Preview has not been visually verified in a browser.
- No real authentication backend; demo login behavior inherited from original code.