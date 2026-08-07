# Handoff: Excalidesk — desktop shell UI

## Overview
Excalidesk is a local-first, file-based drawing app for macOS. A user points it at a folder on disk; every sketch is a plain `.excalidraw` file inside it. The app structure follows Obsidian (folder = vault, tree sidebar, tabs) with an Excalidraw-style canvas as the working surface. This handoff covers the desktop shell: first-launch, missing-folder error, and the three-pane workspace in light/dark and expanded/collapsed sidebar.

## About the design files
`Excalidesk.dc.html` in this bundle is a **design reference created in HTML** — a prototype of the intended look and behavior, not production code. The task is to recreate these designs in the target codebase using its own environment and patterns (React + Feature-Sliced Design, per `CLAUDE_CODE_PROMPT.md`). Do not lift markup or inline styles from the file.

Open it in a browser: it stacks the screens as labeled options — `2a`, `2b` (turn 2, first-run states) and `1a`, `1b`, `1c` (turn 1, workspace states).

## Fidelity
**High-fidelity.** Colors, type sizes, spacing, radii, and hover states below are final and should be matched. Interaction detail (menus, drag, keyboard) is specified in prose where the prototype only implies it.

---

## Design tokens

### Color — light
| Token | Hex | Use |
|---|---|---|
| `--bg-chrome` | `#f7f7f5` | title bar + sidebar |
| `--bg-canvas` | `#fcfcfa` | canvas panel |
| `--bg-surface` | `#ffffff` | popovers, active tab, cards |
| `--bg-hover` | `#ecece8` | hover on chrome controls / tree rows |
| `--bg-active` | `#e7e6e1` | active/selected folder row |
| `--border` | `#e5e4df` | canvas panel border |
| `--border-strong` | `#e2e2de` | inputs, toolbar, popover edges |
| `--border-hover` | `#c9c8c2` | input hover |
| `--text` | `#33322f` | primary UI text |
| `--text-muted` | `#6f6e68` | secondary text |
| `--text-faint` | `#a3a29b` | section headers, icons at rest |
| `--accent` | `#4f7dd4` | selection, active tool icon |
| `--accent-text` | `#2f5cae` | active file label |
| `--accent-bg` | `#e9eef8` | selected file row; `#e6edfa` active tool chip |
| `--dirty` | `#c8a24a` | unsaved dot |
| `--danger` | `#b95c30` | error icon/label; text `#8a3f1c`, body `#96513a`, bg `#fdf6f2`, border `#f0d9cc` |
| canvas dots | `#e6e5df` | 1px radial dots, 22px grid |
| sketch ink | `#1f1f1e`, secondary `#3a6ea8` | drawn elements |

### Color — dark
| Token | Hex |
|---|---|
| `--bg-chrome` | `#161617` |
| `--bg-canvas` | `#232325` |
| `--bg-surface` | `#2a2a2c` |
| `--bg-hover` | `#232325` |
| `--bg-active` | `#2a2a2d` (inset ring `#37373b`) |
| `--border` | `#2b2b2d` |
| `--border-strong` | `#303033` / `#37373b` |
| `--text` | `#d6d5d1` (emphasis `#e6e5e1`) |
| `--text-muted` | `#8b8a85` |
| `--text-faint` | `#6b6b66` |
| `--accent` | `#7aa2e8`, label `#9dbcf2`, row bg `#1e2836`, tool chip `#2b3a50` |
| `--dirty` | `#d8a55f` |
| canvas dots | `#313134` |
| sketch ink | `#d9d8d3`, secondary `#7fa8d8` |

Traffic lights are identical in both themes: `#f0605c`, `#f4bd4f`, `#61c554`, 12px circles, 8px gap; light mode adds `1px solid rgba(0,0,0,.09)`.

### Typography
- UI: system sans (`-apple-system, "Helvetica Neue", Helvetica, sans-serif`), antialiased.
  - Tab / tree / menu row: 12.5px, weight 400; active tab and active folder 500.
  - App name: 12.5px / 600 / `-0.01em`.
  - Section header (`~/Sketches`, `RECENT`, `APPEARANCE`): 10px / 600 / uppercase / `.09em` / `--text-faint`.
  - Card title: 13px / 600. Card subtitle + body: 12–13.5px / line-height 1.6.
  - Status line, zoom, meta: 11–11.5px.
  - Paths: `ui-monospace, Menlo, monospace` 11–12.5px.
- Canvas / wordmark: **Caveat** (Google Fonts, 400/600) — stands in for Virgil. 44px wordmark; 26–30px in-sketch labels.

### Metrics
- Window: 1180px wide, `border-radius: 11px`, `1px solid #d6d5d0`, shadow `0 24px 60px rgba(0,0,0,.16), 0 2px 6px rgba(0,0,0,.08)`. Body height 640px in the mock; in the app it fills the window.
- Title bar: 46px, background = chrome, no bottom border.
- Traffic-light inset: 16px left padding; app name 10px to the right of the last light.
- Sidebar: 260px, no right border.
- Canvas panel: `border-left` + `border-top` 1px `--border`, `border-top-left-radius: 11px` — it reads as a raised panel (Capacities-style).
- Radii: 6px icon buttons, 7px tabs / inputs / tree rows, 8px zoom pill, 9px cards + popover, 10px tool island, 11px window and canvas panel.
- Icon buttons: 24–26px square, 14–15px stroked icons, `stroke-width` 1.4–1.6, `stroke-linecap: round`.

---

## Screens

### 1. Welcome — first launch (`2a`)
No sidebar, no tabs. Title bar: traffic lights, app name, settings gear far right.
Canvas panel holds a vertically and horizontally centered 520px column, `gap: 26px`:
- Wordmark "Excalidesk", Caveat 44px, `#1f1f1e`.
- Explainer, 13.5px/1.6 `--text-muted`, max 44ch, `text-wrap: pretty`: “Your sketches live as plain `.excalidraw` files in a folder on this Mac. Pick that folder to get started — nothing is uploaded anywhere.” (`.excalidraw` inline in mono 12.5px, `--text`).
- Three action rows, `gap: 1px`, each `padding: 13px 14px`, radius 9px, icon 19px + title 13px/600 + subtitle 12px muted + chevron right in `#c2c1ba`. The first is primary: white surface with `box-shadow: 0 0 0 1px var(--border)`, hover ring `#c9c8c2`, accent icon. The other two are flat, hover `#f2f2ee`.
  1. **Open folder** — “Use an existing folder of sketches”
  2. **Create new folder** — “Start a fresh sketch folder”
  3. **Open single file** — “Edit one .excalidraw file without a folder”
- Hint row, 12px `--text-faint`, info icon: “You can drag a folder onto this window instead.”

### 2. Vault error — last folder missing (`2b`)
Same chrome and 520px column, `gap: 24px`.
- Warning card: bg `#fdf6f2`, ring `#f0d9cc`, radius 9px, `padding: 14px 15px`, triangle icon `#b95c30` 18px.
  - Title 13px/600 `#8a3f1c`: “Can't open your last folder”.
  - Body 12.5px/1.6 `#96513a`, path in mono: “`~/Documents/Sketches` no longer exists. It may have been moved, renamed, or deleted outside Excalidesk. Your files are untouched if the folder was only moved — point Excalidesk at its new location.”
- Actions (same row spec as welcome): **Locate folder** (primary, magnifier icon) — “Find where "Sketches" moved to”; **Open another folder** — “Choose a different folder of sketches”.
- **Recent** section: header + rows `padding: 8px 10px`, radius 7px — folder icon, name 12.5px, parent path in mono 11px faint, right-aligned meta. The missing entry renders at `opacity: .55` with meta “missing” in `--danger` and is not clickable; the others show relative time and hover `#f2f2ee`.

### 3. Workspace (`1a` light, `1b` dark, `1c` sidebar collapsed)
**Title bar**, single 46px row, left to right:
- Traffic lights, app name "Excalidesk", sidebar-toggle icon button (panel glyph). In `1a`/`1b` the toggle sits at the right edge of the 260px sidebar column; when collapsed (`1c`) it sits directly after the app name and renders in its active state (`--bg-hover` fill).
- Back / forward chevrons, 24px buttons, `--text-faint`.
- **Tab strip**, `gap: 3px`, flexible width. Each tab: 28px tall, `padding: 0 9px`, radius 7px, file icon 13px + name 12.5px. Active tab: white (`#2a2a2c` dark), `box-shadow: 0 1px 2px rgba(0,0,0,.06), 0 0 0 1px rgba(0,0,0,.05)`, weight 500, close ✕ visible. Inactive: transparent, muted text, hover fills `--bg-hover`; close ✕ appears on hover. A tab with unsaved changes shows a 6px dot in `--dirty` in place of the ✕ until hover.
- **+** new-tab button, 26px.
- Settings gear at the far right, 26px. Clicking opens the menu described below.

**Sidebar** (260px, `--bg-chrome`, no border):
- Section header `~/Sketches` (the opened folder path) with two 14px icons on the right: new folder, new file.
- Tree rows: 27px tall, radius 6px, `gap: 7px`, 12.5px text. Indent 24px per level for folder children, 45px for files under a nested folder. Disclosure chevron 9px, rotated 90° when open. Folder icon 15px, file icon 14px.
  - Hover: `--bg-hover`.
  - Active folder (`Work` in the mock): `--bg-active` + `inset 0 0 0 1px #dcdbd5`, weight 500, and a trailing ⋯ button that opens the same context menu as right-click.
  - Selected file (`system-map.excalidraw`): `--accent-bg` row, `--accent-text` label, accent file icon.
  - A file with unsaved changes shows a 5px `--dirty` dot at the row end.
  - Sample content: `Ideas`, `Work` › `Diagrams` › (`system-map.excalidraw`, `onboarding-flow.excalidraw`), `Work` › `Meetings`, `quick-note.excalidraw` (dirty), `scratchpad.excalidraw`.
- Footer, pushed to the bottom, 11px `--text-faint`, check icon: “Saved to ~/Sketches · 2m ago”.

**Canvas stage**:
- Dotted background: `radial-gradient(<dot> 1px, transparent 1px)`, `background-size: 22px 22px`.
- Floating **tool island**, top-center, 16px from the top: `padding: 5px`, radius 10px, surface + 1px border, shadow `0 4px 14px rgba(0,0,0,.07)`. Six 30px buttons, radius 7px: select, rectangle, diamond, arrow, text, freehand pen. Active tool: `--accent-bg` fill + `--accent-text` icon. Hover on inactive: `--bg-hover`.
- **Zoom pill**, bottom-left 16px: `−  100%  +`, 11.5px, radius 8px, surface + border.
- Sketch content is a static SVG placeholder (two rough rectangles, a diamond, an ellipse, an arrow, a freehand line, Caveat labels “local vault”, “.excalidraw”, “sync?”, “exports”) drawn with double-stroke paths at `stroke-width: 1.9`, the second pass at 35–38% opacity — this is the seam where the real Excalidraw canvas mounts.

**Settings menu** (opened from the gear, shown open in `1a`): 210px popover, radius 9px, `padding: 5px`, surface + `1px solid #dedcd6`, shadow `0 10px 30px rgba(0,0,0,.14)`, anchored 34px below / 10px in from the right.
- Header `APPEARANCE`; rows 29px, radius 6px, 12.5px, icon 14px: **Light** (checked — accent icon + accent check), **Dark**, **Match system**.
- 1px divider, then **Vault settings** and **Preferences** (right-aligned `⌘,`).

---

## Interactions & behavior

| Trigger | Result |
|---|---|
| App boot | Read persisted `lastFolderPath`. Missing key → Welcome. Path exists and readable → Workspace. Path absent/unreadable → Vault error, prefilled with that path. |
| Open folder / Locate folder / Open another folder | Native directory picker. On success persist the path, index `.excalidraw` files, go to Workspace. |
| Open single file | Native file picker filtered to `.excalidraw`. Opens Workspace with a one-tab session and no tree (sidebar shows only that file). |
| Drag folder onto window | Same as Open folder. Show a dashed accent overlay while dragging over. |
| Sidebar toggle / `⌘\` | Collapse or expand; sidebar width animates `200ms ease`; state persisted. |
| Tab click / close / `⌘W` | Activate / close. Closing a dirty tab prompts to save. |
| `+` | New untitled sketch in the current folder, opened as a new active tab. |
| Tree row click | Files open in the active tab (double-click opens a new tab); folders expand/collapse; expansion state persisted per folder. |
| Right-click a tree row or the ⋯ button | Context menu: New file, New folder, Rename, Delete, Reveal in Finder. Delete asks for confirmation and moves to Trash. |
| Tool click / keys `1–6`, `V R D A T P` | Sets the active tool. |
| Theme selection | Sets `data-theme` on `<html>`; “Match system” follows `prefers-color-scheme`; persisted. |
| External file change | Re-read the folder on window focus; if the open file changed on disk and is clean, reload it silently; if dirty, show a conflict bar. |
| Folder disappears while open | Return to the Vault error screen with the same copy. |

Transitions: hover/background 120ms ease; popovers fade+rise 8px over 140ms; sidebar width 200ms ease. No decorative motion.

## State
- `vault`: `{ path, name, tree, status: 'none' | 'ready' | 'missing' }`, `recentFolders: {path, name, lastOpenedAt}[]`.
- `tabs`: `{ id, filePath, title, isDirty }[]`, `activeTabId`.
- `ui`: `sidebarCollapsed`, `expandedFolderPaths`, `theme: 'light' | 'dark' | 'system'`, `activeTool`, `zoom`.
- Persisted (app settings file / `electron-store`): `lastFolderPath`, `recentFolders`, `sidebarCollapsed`, `expandedFolderPaths`, `theme`, `openTabs`.

## Assets
None external. Icons are inline stroked SVGs on a 20×20 viewBox — replace with the codebase's icon set (Lucide matches the weight) rather than porting the paths. Fonts: Caveat from Google Fonts; UI font is the system stack.

## Files
- `Excalidesk.dc.html` — the design reference (all five screens).
- `CLAUDE_CODE_PROMPT.md` — the prompt to paste into Claude Code, including the Feature-Sliced Design layer plan.
