# Prompt for Claude Code — Excalidesk UI (React + Feature-Sliced Design)

Paste this into Claude Code from the repo root, with `design_handoff_excalidesk/` present in the project.

---

You are implementing the UI of **Excalidesk**, a local-first, file-based drawing app for macOS (Electron/Tauri shell, React renderer). It is structured like Obsidian, but the documents are Excalidraw-style `.excalidraw` sketches.

**Design reference:** `design_handoff_excalidesk/Excalidesk.dc.html` — open it in a browser. It is a *design reference in HTML*, not production code. Do not copy its markup. Recreate the visuals in React using the conventions below. Fidelity is **high**: match the hex values, sizes, radii, and spacing in `README.md` exactly.

**Architecture: Feature-Sliced Design (FSD).** Layers, top to bottom — a slice may only import from layers strictly below it:

```
src/
  app/        # app shell, providers, theme, global styles, window frame composition
  pages/      # route-level screens: welcome, vault-error, workspace
  widgets/    # composite blocks: title-bar, file-tree-sidebar, canvas-stage
  features/   # user actions: open-folder, toggle-sidebar, switch-theme, tab-management,
              #                file-tree-context-menu, select-tool
  entities/   # domain models + their presentational units: vault, sketch-file, tab, tool
  shared/     # ui kit (Button, Menu, IconButton, Icon), lib, config, types
```

Rules to follow strictly:
- Every slice exposes a public API via `index.ts`; never deep-import across slices.
- Cross-imports between slices on the same layer are forbidden — lift shared logic down a layer.
- Segments inside a slice: `ui/`, `model/`, `api/`, `lib/`, `config/`.
- Keep filesystem access behind `shared/api/fs` + `entities/vault/api` so the renderer never touches Node APIs directly.

**Stack assumptions** (adjust to what already exists in the repo, and say so if you change them): React 18 + TypeScript, Vite, CSS Modules with CSS custom properties for theming (light/dark via `data-theme` on `<html>`), Zustand for local UI state. Do not add a component library — build the small UI kit in `shared/ui`.

**Scope of this task — build these three pages and the widgets they need:**
1. `pages/welcome` — first launch, no folder opened. Centered 520px column: wordmark, explainer, three actions (Open folder / Create new folder / Open single file), drag-a-folder hint.
2. `pages/vault-error` — last opened folder is missing on relaunch. Warning card naming the path, Locate folder / Open another folder actions, Recent list with the missing entry marked.
3. `pages/workspace` — title bar with traffic-light inset, app name, sidebar toggle, back/forward, tab strip, settings menu; collapsible 260px file-tree sidebar; canvas stage with floating tool island and zoom control. Must render correctly in both light and dark theme and in both sidebar states.

**Behavior to implement** (details and exact copy in `README.md`):
- Last-opened folder path persists across launches; on boot, validate it — valid → `workspace`, missing → `vault-error`, none → `welcome`.
- Sidebar collapse persists.
- Theme: light / dark / match system, chosen from the settings menu, persisted.
- Tabs: open, activate, close on hover-x, dirty dot when the file has unsaved changes.
- File tree: nested folders, expand/collapse, active file highlight, right-click context menu (New file, New folder, Rename, Delete, Reveal in Finder).

**Out of scope:** the drawing engine itself. Render `widgets/canvas-stage` with a stub surface (the dotted background + the reference sketch as a static SVG placeholder) and leave a documented seam where the Excalidraw canvas mounts.

**How to work:**
1. Read `README.md` in the handoff folder first — it has every token, measurement, and string.
2. Propose the file tree for the slices you will create, then wait for my confirmation.
3. Implement `shared` → `entities` → `features` → `widgets` → `pages`, committing per layer.
4. No placeholder `TODO` components in the final state; every screen in scope must render.
