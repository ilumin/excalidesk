# Desktop shell: wiring the UI to Electrobun

The shell UI (title bar, sidebar, tabs, canvas) already ships in `apps/web` and runs
on an in-memory sample vault. This plan connects it to the real machine through
Electrobun: a filesystem service in the bun process, RPC across the seam, and native
window chrome.

The seam already exists and does not change shape. `FsBridge` in
`apps/web/src/shared/api/fs/types.ts` is the contract; `apps/web/src/shared/api/fs/index.ts`
picks `window.excalidesk.fs` when present and falls back to `browserFs` otherwise.
Everything below either implements that interface or gets out of its way.

Verified against the installed `electrobun@1.18.1`: `Utils.openFileDialog`,
`Utils.moveToTrash`, `Utils.showItemInFolder`, `titleBarStyle: "hidden" | "hiddenInset"`,
`BrowserWindow.setWindowButtonPosition`, `BrowserView.defineRPC`, `Electroview`, and
preload-level `app-region: drag` support.

## Step 1 — Fix packaged asset paths

**Blocker. Do this first, alone.**

`apps/web/vite.config.ts` sets no `base`, so the build emits `/assets/…`. Under the
packaged `views://mainview/index.html` scheme that resolves to `views://assets/…` and
the window renders blank. Set `base: "./"`.

Check: `bun run build:desktop`, launch the bundle, confirm the UI paints. No point
wiring RPC into a white window.

## Step 2 — Filesystem service in the bun process

New file: `apps/desktop/src/bun/fs-service.ts`, implementing every `FsBridge` method
with `node:fs/promises` plus Electrobun's `Utils`.

- `readTree` walks the vault recursively, keeping directories and `.excalidraw` files,
  sorted directories-first then by name.
- `pickDirectory` / `pickFile` → `Utils.openFileDialog({ canChooseDirectory: true,
  canChooseFiles: false, allowsMultipleSelection: false })`. It returns `string[]` from
  a comma split, so treat an empty or blank first entry as cancel and return `null`.
- `trash` → `Utils.moveToTrash`; `reveal` → `Utils.showItemInFolder`.
- `writeFile` creates parent directories as needed.

**Not lazy here:** `create*`, `rename`, and `move` take paths from the renderer, so they
validate before touching disk — the resolved target must stay inside the vault root, and
must not clobber an existing entry. This is the trust boundary between web code and the
user's disk.

Leaves behind one `bun test` covering the tree walk (filtering + sort) and the
containment guard (a `../` escape is rejected).

## Step 3 — Share the contract

`apps/desktop` type-only-imports `FsBridge` from the web app through a tsconfig path
alias. No new workspace package, no runtime coupling, and a signature change breaks
type-check on both sides.

Alternative if the alias gets awkward: promote the types file to a tiny
`@excalidesk/fs-contract` package. Only worth it if a third consumer appears.

## Step 4 — RPC wiring

In `apps/desktop/src/bun/index.ts`, build the schema from `FsBridge` and pass it to the
existing window:

```ts
const rpc = BrowserView.defineRPC<FsRPC>({ handlers: { requests: fsService } });
new BrowserWindow({ /* … */, rpc });
```

Each `FsBridge` method maps 1:1 to a request. No messages, no events — the renderer
drives everything.

## Step 5 — Renderer bridge

New file: `apps/web/src/shared/api/fs/desktop-fs.ts`.

`Electroview.defineRPC` + `new Electroview({ rpc })`, then an object forwarding each
`FsBridge` method to `rpc.request.*`, assigned to `window.excalidesk.fs` before React
mounts. Adds `electrobun` as an `apps/web` dependency; its socket init already no-ops
when there is no webview id, so the plain-browser build stays safe.

Upgrade path if the bundle cost ever shows up: move the seam to a dynamic `import()`
behind the `window.__electrobun` check so browser builds never load it.

## Step 6 — Native window chrome

`titleBarStyle: "hiddenInset"` plus `setWindowButtonPosition(16, 16)` puts the *native*
traffic lights inside the 46px title bar — real hover glyphs, real fullscreen behaviour,
and no window-control RPC to maintain.

- `apps/web/src/shared/ui/traffic-lights.tsx` becomes a spacer in the desktop build. Keep
  the component; Storybook and the web build still render it.
- `apps/web/src/widgets/title-bar/ui/title-bar.tsx` gets `app-region: drag`, with
  `no-drag` on the buttons, the tab strip, and the menu triggers.

**Known ceiling:** macOS only. Windows and Linux have no native inset controls, so they
keep the drawn lights and will need explicit `close` / `minimize` / `maximize` RPC calls.
Add that when either platform is actually targeted.

## Step 7 — Verify in the real app

`bun run dev:desktop`, then walk it:

1. Open a folder from the native picker; the tree renders from disk.
2. Create, rename, drag-move, and trash entries; each round-trips to the filesystem.
3. A sketch saves and reloads with its contents.
4. Quit and relaunch; the vault and recent folders come back.

Two things to confirm rather than assume:

- **`localStorage` under `views://`** — if it does not survive relaunch, `shared/lib/persist.ts`
  moves to a bun-side JSON file under Electrobun's `PATHS`.
- **Excalidraw under CEF** — the canvas, fonts, and pointer handling render correctly.

Finish with `bun run build:desktop` and the same walkthrough against the packaged app.

## Sequencing

Steps 1 and 7 are the checkpoints. Steps 2–6 are one continuous chunk — the app stays
broken in between, because step 5 replaces the sample vault before the real one is
proven.

## Deliberately skipped

- Window size/position persistence — add when someone complains about the window.
- File watching for external changes — the vault refreshes on window focus already.
- A dedicated "create folder" dialog; the directory picker makes folders inline.
- Windows and Linux window controls, per step 6.
