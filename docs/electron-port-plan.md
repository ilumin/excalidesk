# Electron shell plan — `apps/electron`

> **Status: phases 1–4 are implemented.** `bun run dev:electron` runs it against
> the Vite dev server, `bun run build:electron` produces
> `apps/electron/release/Excalidesk-0.0.1-arm64.dmg` (112 MB DMG, 272 MB `.app` —
> against Electrobun's 126 MB / 393 MB). Two things came out differently from the
> plan below; both are marked **⚠︎ in practice**. Phase 5 is untouched.

Port the desktop shell from Electrobun to Electron, as a **second** app package.
`apps/desktop` stays untouched until `apps/electron` reaches parity, so both can
be run side by side and diffed.

Baseline is [desktop-shell-summary.md](desktop-shell-summary.md): 22 features,
15 bridge methods, 6 Electrobun workarounds. Five of those six workarounds are
shell APIs Electron already has.

---

## 0. The one thing that makes this cheap

`apps/web/src/shared/api/fs/index.ts` already prefers an injected bridge:

```ts
export const fs: FsBridge = globalThis.window?.excalidesk?.fs ?? desktop ?? browserFs;
```

So Electron's preload writes `window.excalidesk` and the renderer needs **one
file changed** (4 lines) to also route `desktopSettings` / `desktopWindow`
through it. No component rewrites, no new seam. `DesktopApi` in
`shared/api/fs/types.ts` stays the single contract; the Electron main process
type-checks against the same declaration via a `@web/*` path alias, exactly as
`apps/desktop` does today.

---

## 1. Steps

Five phases. Phase 1–3 is the working app; 4–5 is shipping it.

### Phase 1 — Boot a window (~1h)

1. `mkdir apps/electron`, add `package.json` (`electron`, `@types/node`,
   `typescript: catalog:`) and a `tsconfig.json` copied from
   `apps/desktop/tsconfig.json` (keeps the `@web/*` alias).
2. `src/main/index.ts` — `app.whenReady()` → `BrowserWindow` with
   `titleBarStyle: "hiddenInset"`, `trafficLightPosition: { x: 16, y: 16 }`,
   `webPreferences: { preload, contextIsolation: true, nodeIntegration: false, sandbox: true }`.
3. Dev vs packaged URL: `process.env.ELECTRON_DEV` → `loadURL("http://localhost:3001")`,
   else `loadFile("../web/dist/index.html")`.

   **⚠︎ in practice:** `loadFile` renders a blank window. Vite emits
   `<script type="module" crossorigin>`, and a `file://` document is an opaque
   origin, so every module request is blocked by CORS. Risk 1 below, and it
   lands every time — `protocol.registerSchemesAsPrivileged` + `protocol.handle`
   on an `app://` scheme is the shipped answer, ~15 lines in `main/index.ts`.
4. Build main + preload with `bun build --target=node --format=cjs --outdir=dist`.
   No electron-vite, no webpack.

   **⚠︎ in practice:** `bun build` inlines `__dirname` from the *source* path,
   so `join(__dirname, …)` resolves a level off and the preload never loads.
   Use `app.getAppPath()` for both the preload and the assets directory.
5. `bun run dev` in `apps/web`, then `electron .` — expect the UI, dead buttons.

**Exit:** window opens, Excalidraw renders, traffic lights sit in the drawn bar.

### Phase 2 — The 15 bridge methods (~2h)

1. Copy `apps/desktop/src/bun/fs-service.ts` and `settings-service.ts` into
   `src/main/`. Six methods are plain `node:fs/promises` and port unchanged.
   `inVault` / `claim` — the trust boundary — port verbatim. Keep the tests.
2. Swap the nine shell-dependent calls:

   | Electrobun | Electron |
   | --- | --- |
   | `Utils.openFileDialog({ canChooseDirectory })` | `dialog.showOpenDialog(win, { properties: ["openDirectory"] })` |
   | `Utils.openFileDialog({ allowedFileTypes })` | `dialog.showOpenDialog(win, { properties: ["openFile"], filters })` |
   | `Utils.moveToTrash` | `shell.trashItem` |
   | `Utils.showItemInFolder` | `shell.showItemInFolder` |
   | `Updater.appDataFolder()` | `app.getPath("userData")` |
   | `window.isMaximized/maximize/unmaximize` | same names on `BrowserWindow` |

   `showOpenDialog` returns `{ canceled, filePaths }` — drop `firstPath`, the
   comma-joined-string workaround dies with it.
3. `src/main/ipc.ts` — one loop, mirroring `apps/desktop/src/bun/index.ts`:
   `for (const [name, fn] of Object.entries(services)) ipcMain.handle(name, (_e, args) => fn(...args))`.
   No 10-minute timeout knob needed; Electron IPC does not time out.
4. `src/preload/index.ts` — build the same key list from `DesktopApi` and
   `contextBridge.exposeInMainWorld("excalidesk", { fs: api })`, each method
   `(...args) => ipcRenderer.invoke(name, args)`. Preload is sandboxed, so the
   key list is a literal array, not derived at runtime from a type.
5. In `apps/web/src/shared/api/fs/index.ts`, make `desktopSettings` and
   `desktopWindow` fall out of the injected bridge too:

   ```ts
   const injected = globalThis.window?.excalidesk?.fs as DesktopApi | undefined;
   const desktop = injected ?? (globalThis.window?.__electrobun ? createDesktopApi() : null);
   export const fs: FsBridge = desktop ?? browserFs;
   export const desktopSettings: SettingsBridge | null = desktop;
   export const desktopWindow: WindowBridge | null = desktop;
   ```

**Exit:** open a vault, edit, autosave, rename, trash, reveal, reopen — all live
on disk. Settings survive a relaunch.

### Phase 3 — Chrome and menus (~1h)

1. Drag regions: add two rules to the web app's global CSS so the existing class
   names keep working, no component edits.

   ```css
   .electrobun-webkit-app-region-drag { -webkit-app-region: drag; }
   .electrobun-webkit-app-region-no-drag { -webkit-app-region: no-drag; }
   ```

   The properties are inert in a normal browser tab. Rename the classes to
   `app-region-*` in a later cleanup commit, once Electrobun is gone.
2. `toggleMaximize` becomes a **no-op** in Electron: `-webkit-app-region: drag`
   already gives macOS its native double-click-to-zoom, and the app's own
   `onDoubleClick` handler in `title-bar.tsx` would otherwise toggle it back.
   Verify at runtime — if native zoom does not fire, implement it for real and
   guard the handler instead.
3. `traffic-lights.tsx` — the `__electrobun` check becomes an `isDesktop` export
   from `shared/api/fs`, true for either shell.
4. `Menu.buildFromTemplate` with the same role list as
   `apps/desktop/src/bun/index.ts` (about / hide / hideOthers / quit). Keep both
   comments: no Edit menu, no Window > Close — a native key equivalent wins
   before web content sees ⌘Z or ⌘W.

**Exit:** ⌘Q quits, the bar drags, double-click zooms, no WebKit context menu.

### Phase 4 — Package (~2h)

1. Add `electron-builder`, `mac: { target: "dmg", arch: ["arm64"] }`, files =
   `dist/` + `../web/dist`.
2. Wire turbo: `build` in `apps/electron` runs `turbo run build -F web` first,
   same shape as `apps/desktop`.
3. Root scripts: `dev:electron`, `build:electron`.
4. Compare the DMG against the 126 MB / 393 MB Electrobun numbers in
   [desktop-package-size.md](desktop-package-size.md).

**Exit:** a `.app` that opens a real vault from a cold launch.

### Phase 5 — Optional, only if wanted

1. `electron-updater` for stable/canary, replacing Electrobun's `Updater`.
2. Code signing + notarization — this is what removes the ~26 s first launch.
3. Delete `apps/desktop`, rename `apps/electron` → `apps/desktop`, drop the
   `electrobun` dependency from `apps/web`, rename the drag classes.

---

## 2. What gets deleted

Electron closes five of the six Electrobun workarounds. Deleting the app code
they forced is **not** part of phases 1–4 — it is scope creep, and the in-app
versions work on every platform. Listed so the option is on record:

| Now possible | Cost to take it | Verdict |
| --- | --- | --- |
| `dialog.showSaveDialog` replaces `save-as-dialog.tsx` (~150 lines) | Rewrites a working feature | Later, maybe never — the in-app one is cross-platform |
| `dialog.showMessageBox` replaces `confirm-dialog.tsx` | Same | Later, maybe never |
| Persistent `localStorage` replaces the settings JSON file | Rewrites `persist.ts` | No. The JSON file is 25 lines and already works |
| Native double-click zoom | One no-op | **Take it** — phase 3 |
| No RPC timeout | Delete `maxRequestTime` | Free, comes with the port |

## 3. Risks, in order

1. ~~**`file://` asset loading.**~~ **Hit, fixed.** See the ⚠︎ on phase 1 step 3.
   The `app://` scheme is privileged (`standard`, `secure`, `supportFetchAPI`),
   so the page also gets a real origin for `localStorage` and `fetch`. The
   handler confines every request under the assets directory.
2. **`sandbox: true` + preload.** Fine for `ipcRenderer` + `contextBridge`, but
   any accidental `node:` import in preload fails at load. Keep preload to those
   two imports and a string array. Held so far.
3. **Two shells in one repo.** `apps/web` gains an Electron-shaped branch while
   still depending on `electrobun`. Time-boxed: phase 5 step 3 removes it.

## 4. What was verified, and what was not

**Exercised end to end** through the real preload → `ipcRenderer.invoke` →
`ipcMain.handle` → service seam, in the built bundle: all 15 methods exposed,
`readTree`, `createFile`, the vault-boundary refusal, a `writeSettings` /
`readSettings` round trip, and `toggleMaximize`. Plus `bun test` on the vault
boundary and a clean `bun run check-types`.

**Seen on screen:** the window in both dev and packaged builds — frameless, real
traffic lights at (16, 16), the app-drawn title bar, the Welcome screen.

**Not yet confirmed:** anything needing a click or a keystroke. The native
directory picker, dragging the title bar, double-click-to-zoom, ⌘Q, and the
application menu all type-check and are wired, but this machine denies
`osascript` assistive access, so none were driven. Launch it and try those five.
