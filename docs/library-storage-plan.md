# Excalidraw libraries on disk

Library items the user adds today survive nothing: not a tab switch, not a quit.
This plan gives them a file in the app's data directory, loaded once at boot and
written back on every change, shared by every vault and every tab.

Three steps, ~2 h total for whoever executes them. Steps 1 and 2 are the feature;
step 3 is the follow-up that makes `libraries.excalidraw.com` usable and can be
dropped.

## Verified against the installed `@excalidraw/excalidraw@0.18.1`

- The package **does not persist library items**. The only two `localStorage`
  keys in `dist/prod/index.js` are `PUBLISH_LIBRARY` (the publish form's author
  fields) and `MERMAID_TO_EXCALIDRAW`. Persistence is the host app's job, via
  `initialData.libraryItems` in and `onLibraryChange` out.
- `apps/web/src/widgets/canvas-stage/ui/canvas-stage.tsx` passes neither. So the
  library is in-memory, and `key={activeTabId}` remounts the editor on every tab
  switch — the library empties there too, not just on quit.
- Exported helpers exist and are the ones to use:
  `serializeLibraryAsJSON(items)`, `restoreLibraryItems(items, "unpublished")`,
  `loadLibraryFromBlob(blob)`, `mergeLibraryItems(a, b)`.
- `Excalidraw.updateLibrary({ libraryItems, merge, openLibraryMenu })` is on the
  imperative API already published to `useEditorStore`.

## Where the file goes

`~/Library/Application Support/excalidesk/library.excalidrawlib`, next to
`settings.json` — Electron's `app.getPath("userData")`, the electrobun
equivalent in `apps/desktop/src/bun/settings-service.ts`.

**Decided: one global library**, in the app's data directory, not per vault. That
matches Excalidraw's own model — a library is a personal toolbox, not a property
of one folder of sketches — and a library added while working in one vault is
there in the next. Per-vault would change only the path in step 1; everything
above the bridge is identical.

**Not in `settings.json`.** Library items carry element data and, with image
items, base64 blobs. `saveSetting` rewrites the whole settings blob on every
change and mirrors it in memory for synchronous reads — fine for a dozen scalar
keys, wrong for something that grows to megabytes.

Real `.excalidrawlib` v2 format, not a private shape: the user can copy the file
out, mail it, or drop someone else's in.

## Step 1 — Two more bridge methods (~45 min)

**Contract.** `apps/web/src/shared/api/fs/types.ts` gains a fourth interface
alongside `FsBridge` / `SettingsBridge` / `WindowBridge`:

```ts
/**
 * Library items live beside settings, in one `.excalidrawlib` file the user can
 * copy out. Too large for the settings blob, which is rewritten whole per change.
 */
export interface LibraryBridge {
  /** Raw `.excalidrawlib` JSON; null before the first library is saved. */
  readLibrary(): Promise<string | null>;
  writeLibrary(contents: string): Promise<void>;
}
```

`DesktopApi` becomes the intersection of all four. `DesktopRequests` is derived
from it, so both bun and main type-check against the same signatures for free.
The bridge count in the README table goes 15 → 17 on both shells.

**Electron.** New `apps/electron/src/main/library-service.ts`, a copy of
`settings-service.ts` with a different filename and no JSON parsing — the
renderer parses. Register in `index.ts`; forward both methods in
`preload/index.ts` (the list is one line per method deliberately, so a missing
forward fails to compile).

**Electrobun.** Same file under `apps/desktop/src/bun/`, same registration.

**Browser.** `browser-fs.ts` returns `null` / no-ops, exactly as the fs stub does
— the browser build already has `localStorage`, and losing the library there on
a hard refresh is not worth a second code path.

Leaves behind: extend `fs-service.test.ts`'s pattern with a `library-service.test.ts`
on one shell — write, read back, and read-with-no-file-yet returns null.

## Step 2 — Load once, write on change (~1 h)

**New slice `entities/library`**, mirroring `entities/sketch-file`:

- `api/library-storage.ts` — `hydrateLibrary()`, `getLibraryItems()`,
  `saveLibraryItems(items)`.
- `index.ts` — re-exports those three.

`hydrateLibrary()` reads the file, `JSON.parse`s it, runs the items through
`restoreLibraryItems` (it tolerates older versions and drops malformed entries),
and caches them at module level. A parse failure logs and yields an empty
library; it must not block boot. Called from `src/bootstrap.ts` next to
`hydrateSettings`, before the app mounts.

The module-level cache is what survives the remount: `canvas-stage` reads it
synchronously in `initialData`, so switching tabs re-seeds the same library
instead of an empty one.

`saveLibraryItems` serializes with `serializeLibraryAsJSON`, updates the cache,
and chains the write onto a single serialized promise — the same `let writing =
Promise.resolve()` pattern `shared/lib/persist.ts` uses, so a burst of adds
cannot land out of order. No debounce: library changes are discrete user
actions, not a 60 Hz stream like the canvas.

**Wiring in `canvas-stage.tsx`,** two lines on the `<Excalidraw>` element:

```tsx
initialData={{ ...scene, libraryItems: getLibraryItems(), /* …as today */ }}
onLibraryChange={saveLibraryItems}
```

`onLibraryChange` fires on the tab that made the change. Other mounted tabs are
not live — the editor is remounted per tab anyway, so the next switch picks the
new items up from the cache. No cross-tab broadcast needed.

## Step 3 — Import a `.excalidrawlib` file (~20 min, optional)

Excalidraw's library panel has a **Browse libraries** link to
`libraries.excalidraw.com`. In a desktop shell that round-trip does not close:
the site hands the library back by navigating to `libraryReturnUrl` with the data
in the hash, which a `views://` or `file://` renderer cannot receive. Deep-link
handling (a custom URL scheme, both shells) is the real fix and is not worth it
for this.

The cheap path uses what already exists. A **Import library…** item in the Canvas
group of `features/editor-controls/ui/editor-menu-items.tsx`:

1. `pickFile([".excalidrawlib", ".excalidraw"])` — already on `FsBridge`.
2. `readFile(path)` — already there. Wrap the string in a `Blob` and hand it to
   `loadLibraryFromBlob`.
3. `api.updateLibrary({ libraryItems, merge: true, openLibraryMenu: true })`.

`onLibraryChange` then fires with the merged set and step 2 persists it. The user
downloads from the site in their browser, then imports the file.

## Deliberate omissions

- **No library manager UI.** Excalidraw's own panel already adds, removes,
  and exports items. A second surface for the same thing is one to keep in sync.
- **No file watching.** Editing `library.excalidrawlib` by hand while the app is
  running is not a case worth code; the change lands on next launch.
- **No publishing.** `PUBLISH_LIBRARY` stays in the webview's `localStorage`,
  where it is thrown away on quit under `views://`. It holds a name and an email
  for a flow that needs a working return URL anyway — see step 3.
- **No migration.** There is nothing on disk today to migrate from.
