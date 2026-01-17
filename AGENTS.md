# Repository Guidelines

## Project Structure & Module Organization
- `index.tsx` bootstraps the React app; `App.tsx` owns top-level routing and state.
- `pages/` contains route-level views (e.g., `Home.tsx`, `TodoList.tsx`).
- `components/` holds reusable UI pieces (timer display, prompts, header, stats).
- `types.ts` and `utils.ts` centralize shared types and helpers.
- `public/` hosts static assets; `dist/` is the Vite build output.
- `src-tauri/` contains the Tauri (Rust) desktop wrapper.

## Build, Test, and Development Commands
- `npm install`: install dependencies.
- `npm run dev`: start the Vite dev server for local development.
- `npm run build`: create a production build in `dist/`.
- `npm run preview`: serve the production build locally.
- `npm run tauri dev`: run the macOS desktop app in dev mode.
- `npm run tauri build`: build the macOS app bundle.

Local config: no external services required; data is stored in `localStorage`.

## Coding Style & Naming Conventions
- Language: TypeScript + React with ES modules.
- Formatting: 2-space indentation, semicolons, and single quotes (match existing files).
- Naming: components and files in PascalCase (e.g., `TaskSection.tsx`), functions and variables in camelCase.
- Prefer colocating component-specific logic in `components/` and route-specific logic in `pages/`.

## Testing Guidelines
- No automated test framework is configured yet.
- Validate changes manually in the dev server and check core flows (timer, tasks, stats).
- If you add tests, include a new npm script and document it here.

## Commit & Pull Request Guidelines
- Follow the existing Conventional Commits pattern from history (e.g., `feat: add break prompt`).
- Keep commits focused and descriptive.
- PRs should include a short summary, testing notes (commands + manual checks), and screenshots or recordings for UI changes. Link relevant issues if applicable.

## Configuration & Security Notes
- Environment variables are optional; keep any secrets out of version control.
- Avoid committing generated assets from `dist/`.
