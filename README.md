# excalidesk

This project was created with [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack), a modern TypeScript stack that combines React, TanStack Router, and more.

## Features

- **TypeScript** - For type safety and improved developer experience
- **TanStack Router** - File-based routing with full type safety
- **TailwindCSS** - Utility-first CSS for rapid UI development
- **Shared UI package** - shadcn/ui primitives live in `packages/ui`
- **Electrobun** - Lightweight desktop shell for web frontends
- **Turborepo** - Optimized monorepo build system

## Getting Started

First, install the dependencies:

```bash
bun install
```

Then, run the development server:

```bash
bun run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser to see the web application.

## UI Customization

React web apps in this stack share shadcn/ui primitives through `packages/ui`.

- Change design tokens and global styles in `packages/ui/src/styles/globals.css`
- Update shared primitives in `packages/ui/src/components/*`
- Adjust shadcn aliases or style config in `packages/ui/components.json` and `apps/web/components.json`

### Add more shared components

Run this from the project root to add more primitives to the shared UI package:

```bash
npx shadcn@latest add accordion dialog popover sheet table -c packages/ui
```

Import shared components like this:

```tsx
import { Button } from "@excalidesk/ui/components/button";
```

### Add app-specific blocks

If you want to add app-specific blocks instead of shared primitives, run the shadcn CLI from `apps/web`.

## Project Structure

```
excalidesk/
├── apps/
│   ├── web/         # Frontend application (React + TanStack Router)
├── packages/
│   ├── ui/          # Shared shadcn/ui components and styles
```

### Renderer layout (Feature-Sliced Design)

`apps/web/src` follows FSD — a slice may only import from layers strictly below
it, and always through the slice's `index.ts`.

```
app/        # boot + screen selection, design tokens (app/styles/tokens.css)
pages/      # welcome, vault-error, workspace
widgets/    # title-bar, file-tree-sidebar, canvas-stage
features/   # open-folder, toggle-sidebar, switch-theme, tab-management,
            # file-tree-context-menu
entities/   # vault, sketch-file, tab
shared/     # ui kit, lib, api/fs
```

Filesystem access lives behind `shared/api/fs` (interface + browser stub) and
`entities/vault/api` / `entities/sketch-file/api`. The desktop shell supplies the
real implementation on `window.excalidesk.fs`; nothing above that boundary
touches Node APIs.

Files open the way VS Code does: a single click previews into one reusable tab
(italic title), a double click or the first edit keeps it. Tree rows drag onto
folders to move; open tabs follow the file.

The settings menu is the app's only settings surface — Appearance, Canvas, and
Vault (open another folder, recent vaults, close vault) as inline groups. Each
group renders only when it has something to act on. There is no preferences
dialog: every setting fits in the menu, and an empty window would be worse.

Focus mode (the ⤢ button in the title bar) hides the title bar and sidebar so
the editor fills the window; the bottom-centre pill or `Esc` leaves it. `Esc` is
handled in the capture phase because Excalidraw stops propagation on its own
container, so it steps aside while the text editor, a modal, or a dropdown is open.

Excalidraw's ☰ menu, ? button, and Library trigger are hidden (`display: none`
by class name — Excalidraw exposes no prop for it, and a rename there fails
visibly rather than silently). The actions worth keeping moved into the app's
settings menu as a Canvas group: Find on canvas, Library, Export as PNG, Clear
canvas, and a **Compact interface** toggle (on by default) that swaps
Excalidraw's own button and icon size variables. All in
`features/editor-controls`.

`widgets/canvas-stage` mounts the real Excalidraw editor. It uses Excalidraw's
own toolbar, style panel, and zoom control — they already sit where the design
reference puts them, and keeping them means no CSS overrides of vendor class
names. Only Excalidraw's public theming variables are reassigned, in
`widgets/canvas-stage/ui/excalidraw-theme.css`. Scenes load from and write back
to the active tab's file on an 800 ms debounce.

Design tokens from the handoff are CSS custom properties in
`apps/web/src/app/styles/tokens.css`, exposed as Tailwind `ed-*` colors and
switched by the `.dark` class that next-themes toggles.

## Storybook

Every screen and the shared UI primitives have stories, with a toolbar switch
for light/dark:

```bash
bun run --cwd apps/web storybook
```

## Available Scripts

- `bun run dev`: Start all applications in development mode
- `bun run build`: Build all applications
- `bun run dev:web`: Start only the web application
- `bun run check-types`: Check TypeScript types across all apps
- `bun run dev:desktop`: Start the Electrobun desktop app with HMR
- `bun run build:desktop`: Build the stable Electrobun desktop app
- `bun run build:desktop:canary`: Build the canary Electrobun desktop app
