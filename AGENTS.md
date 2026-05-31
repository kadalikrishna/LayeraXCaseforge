# Repository Guidelines

## Project Structure & Module Organization

This repository is a small Next.js 14 TypeScript app for a Phase 1 parametric phone case generator. The main route is `app/case-generator/page.tsx`; `app/page.tsx` redirects `/` to that page. Shared app metadata and global styles live in `app/layout.tsx` and `app/globals.css`.

Case-generator UI components live under `components/case-generator/`. Geometry and parameter logic live in `lib/`, especially `case-params.ts`, `case-geometry.ts`, and `jscad-to-three.ts`. Generated and dependency folders such as `.next/` and `node_modules/` should not be edited. Legacy standalone files (`index.html`, `script.js`, `styles.css`) appear to be separate from the Next.js app; avoid changing them unless the task explicitly targets them.

## Build, Test, and Development Commands

- `npm install`: install dependencies from `package-lock.json`.
- `npm run dev`: start the local Next.js development server.
- `npm run build`: create a production build and catch TypeScript/build errors.
- `npm run start`: serve the production build after `npm run build`.
- `npm run lint`: run Next.js ESLint checks.

Open the app at `http://localhost:3000/case-generator` during development.

## Coding Style & Naming Conventions

Use TypeScript, React function components, and explicit exported types where useful. Follow the existing style: two-space indentation, double quotes, semicolons, and named exports for reusable components/helpers. Use `PascalCase` for React components (`CasePreview`), `camelCase` for functions and variables (`createPhoneCaseGeometry`), and lowercase route folders under `app/`.

Keep geometry calculations in `lib/` and rendering/UI state in `components/`. Prefer CSS Modules for component-specific styling, as shown by `case-generator.module.css`.

## Testing Guidelines

No automated test framework is currently configured. For now, validate changes with:

1. `npm run lint`
2. `npm run build`
3. Manual browser testing at `/case-generator`

For future tests, prefer colocated `*.test.ts` or `*.test.tsx` files and focus on pure helpers in `lib/` before UI behavior.

## Commit & Pull Request Guidelines

This working folder is not currently a Git repository, so no local commit convention can be inferred. Use short, imperative commit messages such as `Add case dimension validation` or `Fix preview geometry normals`.

Pull requests should include a concise description, manual test notes, screenshots or screen recordings for UI changes, and any known limitations. Mention geometry changes explicitly because they affect the generated 3D model.

## Agent-Specific Instructions

Keep edits scoped to the Next.js app unless asked otherwise. Do not modify generated output in `.next/`, installed packages in `node_modules/`, or lockfiles unless dependency changes require it.
