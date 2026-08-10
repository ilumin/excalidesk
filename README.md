# excalidesk

A desktop Excalidraw: open a folder of `.excalidraw` files, browse them in a
sidebar, edit them in tabs, save back to disk.

**Secondary goal:** compare [Electrobun](https://electrobun.dev) against
[Electron](https://electronjs.org) on the same app. The same renderer
(`apps/web`) runs on both shells — `apps/desktop` (Electrobun) and
`apps/electron` — behind one 17-method bridge contract, so they can be run side
by side and diffed. Neither has been dropped yet.

| | Electrobun | Electron |
| --- | --- | --- |
| DMG | 126 MB | 112 MB |
| Installed `.app` | 393 MB | 272 MB |
| Bridge methods | 17 | 17 |
| Shell workarounds needed | 6 | 1 |

Details in [docs/desktop-package-size.md](docs/desktop-package-size.md) and
[docs/electron-port-plan.md](docs/electron-port-plan.md).

Built on [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack):
TypeScript, React 19, TanStack Router, TailwindCSS, Turborepo, shared shadcn/ui
in `packages/ui`.

## Install

Requires [Bun](https://bun.sh) 1.3+ (the repo pins `bun@1.3.14`).

```bash
bun install
```

## Run locally

Pick one shell — each starts the Vite dev server on
[http://localhost:3001](http://localhost:3001) and points the shell at it, with
HMR:

```bash
bun run dev:electron   # Electron shell
bun run dev:desktop    # Electrobun shell
bun run dev:web        # browser only — no filesystem, stubbed bridge
```

In the browser the filesystem bridge is a stub (`shared/api/fs`), so opening a
vault does nothing. Use one of the desktop shells to work with real files.

## Build

### Electron builds (cross-platform)

```bash
bun run build:electron
```

Creates installers in `apps/electron/release/`:
- `Excalidesk-0.0.2-arm64.dmg` (macOS)
- `Excalidesk-0.0.2-x64.exe` (Windows installer)
- `Excalidesk-0.0.2.exe` (Windows portable)

Other builds:

```bash
bun run build:desktop         # → apps/desktop/artifacts/stable-macos-arm64-excalidesk.dmg
bun run build:desktop:canary  # same, canary channel
bun run build                 # web + Electrobun shell
```

Both shells build `apps/web` first, then package it. Unsigned builds:
- macOS: Gatekeeper holds the first launch for ~25 s. Signing and notarizing required for distribution.
- Windows: SmartScreen may warn on first run. Code signing (EV certificate) removes warnings.

## Release

### Automated release via GitHub Actions

Push a version tag to trigger a build and GitHub release:

```bash
# Update version in apps/electron/package.json
# Then:
git add apps/electron/package.json
git commit -m "chore: version 0.0.2"
git tag v0.0.2
git push origin main
git push origin v0.0.2
```

GitHub Actions will:
- Build Electron app (macOS DMG + Windows EXE)
- Create release page on GitHub
- Attach installers for download

Check progress: [Actions tab](https://github.com/ilumin/excalidesk/actions)

### Manual build and release (local)

```bash
bun run build:electron
cd apps/electron/release
# Upload files to GitHub release manually or via:
# gh release create v0.0.2 Excalidesk-*.dmg Excalidesk-*.exe
```

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
│   ├── web/         # Renderer (React + TanStack Router) — shell-agnostic
│   ├── desktop/     # Electrobun shell
│   ├── electron/    # Electron shell (main + preload)
├── packages/
│   ├── ui/          # Shared shadcn/ui components and styles
```

Both shells implement the same `DesktopApi` declared in
`apps/web/src/shared/api/fs/types.ts` and type-check against it through a
`@web/*` alias, so a signature change breaks both sides at once.

### Renderer layout (Feature-Sliced Design)

`apps/web/src` follows FSD — a slice may only import from layers strictly below
it, and always through the slice's `index.ts`.

```
app/        # boot + screen selection, design tokens (app/styles/tokens.css)
pages/      # welcome, vault-error, workspace
widgets/    # title-bar, file-tree-sidebar, canvas-stage
features/   # open-folder, toggle-sidebar, switch-theme, tab-management,
            # file-tree-context-menu
entities/   # vault, sketch-file, tab, library
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
settings menu as a Canvas group: Find on canvas, Library, Import library, Export
as PNG, Clear canvas, and a **Compact interface** toggle (on by default) that
swaps Excalidraw's own button and icon size variables. All in
`features/editor-controls`.

The library itself is one global `.excalidrawlib` file in the app data folder
(`readLibrary` / `writeLibrary` on the bridge), read once at boot by
`entities/library` and written back on every change. Excalidraw's npm package
persists nothing of its own, and the editor is remounted per tab, so without
this the library emptied on every tab switch. Import exists because
Excalidraw's own "Browse libraries" hands the library back through
`libraryReturnUrl`, a round trip an `app://` or `views://` renderer cannot
receive — download the file, then import it.

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

- `bun run dev:web`: Vite dev server only, in the browser
- `bun run dev:electron`: Electron shell + Vite dev server, with HMR
- `bun run dev:desktop`: Electrobun shell + Vite dev server, with HMR
- `bun run build:electron` / `build:desktop` / `build:desktop:canary`: package a DMG
- `bun run check-types`: type-check every app, both shells included
