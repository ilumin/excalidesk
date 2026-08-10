# Desktop shell: what this branch delivers

Branch `dev-by/opus`, seven commits past `master`. It takes the Excalidesk UI —
which already ran in a browser against an in-memory sample vault — and makes it a
real macOS app on Electrobun: a live filesystem, native window chrome, and the
menus and dialogs an app is expected to have.

Written so the feature list can be checked off against another shell (Electron,
Tauri, Wails, Neutralino). The columns that matter for that are **needs from the
shell** and **cost on Electrobun**.

Measured against `electrobun@1.18.1`, CEF 147, Bun 1.3.14, macOS arm64.

---

## 1. Feature list

### Vault and files

| # | Feature | Needs from the shell | Cost on Electrobun |
| --- | --- | --- | --- |
| 1 | Open a folder as a vault | Native directory picker | `Utils.openFileDialog({ canChooseDirectory })`. Returns a comma-joined string, so a blank first entry is the cancel signal |
| 2 | Recent folders, reopened on launch | Persistent app-level storage | **Workaround.** `localStorage` is discarded on relaunch under `views://`, so settings live in a bun-side JSON file |
| 3 | File tree of `.excalidraw` files | Recursive directory read | `node:fs/promises` in the bun process |
| 4 | Create file / folder, rename, move, delete | fs writes + a trash API | `node:fs/promises` plus `Utils.moveToTrash` |
| 5 | Reveal in Finder | OS file-manager handoff | `Utils.showItemInFolder` |
| 6 | Autosave, debounced 800 ms | fs write | `node:fs/promises` |
| 7 | Tabs follow files renamed or moved on disk | — | Pure app logic; no shell involvement |

### Window chrome

| # | Feature | Needs from the shell | Cost on Electrobun |
| --- | --- | --- | --- |
| 8 | Frameless window, app-drawn 46 px title bar | Hidden/inset title bar | `titleBarStyle: "hiddenInset"` |
| 9 | Native traffic lights inside that bar | Reposition the window buttons | `setWindowButtonPosition(16, 16)` |
| 10 | Drag the window by the title bar | Drag regions in web content | Preload handles `.electrobun-webkit-app-region-drag` / `-no-drag` on `mousedown` |
| 11 | Double-click the title bar to zoom | Maximize/restore + a maximized query | **Workaround.** The preload has no double-click handling — the app listens itself and calls a `toggleMaximize` RPC over `isMaximized()` / `maximize()` / `unmaximize()` |
| 12 | ⌘Q quits; About / Hide / Hide Others | Application menu | `ApplicationMenu.setApplicationMenu` with role-based items; AppKit attaches the key equivalents |
| 13 | Focus mode — canvas fills the window | — | Pure CSS |

### Menus and dialogs

| # | Feature | Needs from the shell | Cost on Electrobun |
| --- | --- | --- | --- |
| 14 | Right-click a tree row → file actions | — | Base UI `ContextMenu`, in-app |
| 15 | Right-click a tab → Close / Close Others / Close All / Save As… | — | Base UI `ContextMenu`, in-app |
| 16 | No WebKit Reload / Inspect Element menu | A way to suppress the native menu | One document-level `contextmenu` → `preventDefault()`. No shell API needed |
| 17 | Confirm before destructive actions | Native message box | **Workaround.** `Utils.showMessageBox` never returns from the bun process, and `window.confirm` titles itself `JavaScript Confirm - views://mainview`. The app owns the sheet |
| 18 | Name a new file / rename inline | Native text prompt | **Workaround.** `window.prompt` has the same title problem and blocks the renderer, so naming happens in the tree row |
| 19 | Save As… destination | Native save panel | **Workaround.** No `NSSavePanel` exists anywhere in the API. The app supplies a name field plus a "Choose…" button that reuses the *open* panel for the folder |

### Build and distribution

| # | Feature | Needs from the shell | Cost on Electrobun |
| --- | --- | --- | --- |
| 20 | Packaged app loads its own assets | Custom scheme that resolves relative URLs | `base: "./"` in Vite and hash history — absolute `/assets/…` resolves to `views://assets/…` and renders blank |
| 21 | HMR during development | Point the window at a dev server | `Updater.localInfo.channel()` + a `HEAD` probe of `localhost:3001` |
| 22 | Stable / canary channels, self-update | Updater | `Updater`, `electrobun build --env=` |

---

## 2. Where Electrobun 1.18 needed working around

Six of the twenty-two features could not use the shell API as-is. This is the
list worth diffing against a candidate framework, because each one is app code
that a better-equipped shell would delete.

| Gap | Consequence | Would Electron/Tauri need this? |
| --- | --- | --- |
| No save panel (`NSSavePanel`) | Custom Save As dialog, ~150 lines | No — both expose one |
| `Utils.showMessageBox` never returns from the bun process | Custom confirm sheet | No — both expose one |
| `window.confirm` / `prompt` title themselves with the page origin | Inline rename in the tree | Same in any Chromium shell; the inline UI is arguably better anyway |
| `localStorage` dropped on relaunch under `views://` (CEF rejects the nested profile path and silently falls back to in-memory) | Settings service + a bun-side JSON file | No — both have a persistent partition |
| No double-click-to-zoom on drag regions | App-side handler + one RPC | Electron: no, `-webkit-app-region: drag` gets it free. Tauri: also custom |
| Default 10 s RPC timeout expires while a modal picker is open | `maxRequestTime` raised to 10 min | Electron IPC has no timeout |

Two more sharp edges, both fixed in app code and neither a shell limitation
exactly:

- `rpc.request` is a catch-all proxy, so resolving a promise with it makes the
  runtime probe `.then` — which becomes a bogus RPC call.
- Arguments cross the seam as JSON, so an omitted optional argument arrives as
  `null` and defeats the default parameter on the far side. Trailing `undefined`
  is trimmed before sending.

---

## 3. What a framework swap would actually cost

The renderer never touches a shell API. Everything crosses one seam,
`apps/web/src/shared/api/fs/types.ts`:

```
FsBridge        12 methods   pickDirectory pickFile exists readTree readFile
                             writeFile createFile createDirectory rename move
                             trash reveal
SettingsBridge   2 methods   readSettings writeSettings
WindowBridge     1 method    toggleMaximize
```

**15 methods.** Porting means reimplementing those and the process entry point.
Concretely:

| Replace | Keep unchanged |
| --- | --- |
| `apps/desktop/` entirely (~400 lines: 3 services + entry) | All of `apps/web/` except two files |
| `shared/api/fs/desktop-fs.ts` — the RPC transport | `browser-fs.ts`, the in-memory fallback |
| | `shared/api/fs/types.ts` — the contract itself |

`DesktopRequests` is derived from `DesktopApi`, so the shell process type-checks
against the same declaration the renderer uses; a signature change breaks both
sides at once. That property is worth preserving in whatever comes next.

Six of the fifteen methods are plain `node:fs/promises` and port unchanged to any
Node/Bun-hosted shell. The other nine are picker, trash, reveal, app-data path,
and window control — the ones to check first in a candidate's API.

---

## 4. Size and startup

Full measurements in [desktop-package-size.md](desktop-package-size.md). The
headline, since it is usually the deciding number in this comparison:

| | |
| --- | --- |
| DMG | 126 MB |
| Installed `.app` | 393 MB |
| ↳ CEF | 305 MB |
| ↳ Bun runtime | 63 MB |
| First launch (unsigned) | ~26 s, Gatekeeper scanning a new 393 MB bundle |
| Later launches | ~3 s |

Electrobun ships CEF and Bun as two separate payloads where Electron merges
Chromium and Node into one framework, which is why this is larger than an arm64
Electron app (Notion 284 MB) despite doing less. Tauri would use the system
WebView and land in single-digit MB, at the cost of WebKit-vs-Chromium rendering
differences across platforms.

---

## 5. Verification status

Honest accounting, because the table above mixes two levels of confidence.

**Verified in the packaged app** — features 1–10, 14, 17, 18, 20–22. Each was
exercised in a built `.app`, and the commit messages record what was checked.

**Type-checked and unit-tested, not yet run in the packaged app** — features 11,
12, 15, 16, 19. Covered by `bun test` (`window-service.test.ts`,
`tab-store.test.ts`) and a clean `bun run check-types`, but the RPC round trip,
the ⌘Q key equivalent, and the suppressed native menu need a launch to confirm.

**Known ceilings, accepted deliberately**

- Quitting is not gated on unsaved edits, so ⌘Q can drop up to one autosave
  debounce (800 ms) of work. `Utils.quit` reads its `beforeQuit` veto
  synchronously, so the renderer cannot be asked in time.
- Suppressing the native context menu is blanket, so text fields lose the native
  copy/paste menu. ⌘C/⌘V still work.
- Traffic lights are macOS-only. Windows and Linux keep the drawn placeholders
  and would need explicit close/minimize/maximize RPC.
- No code signing or notarization yet; both are `false` in `electrobun.config.ts`
  and are what removes the 26 s first launch.
