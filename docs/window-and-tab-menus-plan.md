# Window chrome and tab menus

Four small features that finish the desktop chrome: double-click the title bar to
zoom, an application menu so ⌘Q quits, suppression of WebKit's native context
menu, and a right-click menu on tabs.

They are independent — any one can ship alone, in any order. Sizes below are for
whoever executes them.

Verified against the installed `electrobun@1.18.1`:

- `BrowserWindow.maximize()`, `unmaximize()`, `isMaximized()` exist.
- Its preload has **no** double-click-to-zoom handling, only `mousedown` drag
  regions (`dist/api/bun/preload/dragRegions.ts`). The handler is ours to write.
- `ApplicationMenu.setApplicationMenu` accepts role-based items, and `quit` is in
  `roleLabelMap`. AppKit attaches ⌘Q itself.
- There is **no** save panel of any kind. `Utils.openFileDialog` wraps
  `NSOpenPanel` only, so "Save As…" has to supply its own destination UI.

## Step 1 — ⌘Q quits (~30 min)

Bun process only, no renderer changes. `apps/desktop/src/bun/index.ts` calls
`ApplicationMenu.setApplicationMenu` with a single App submenu: `about`, a
divider, `hide` and `hideOthers`, a divider, `quit`. All roles, no actions, no
accelerator strings — AppKit supplies the key equivalents.

A renderer `keydown` listener was the alternative and is worse: it misses
keystrokes aimed at native subviews, and leaves the app with no menu bar.

**Three deliberate omissions.**

No Edit menu. The `undo`/`cut`/`copy`/`paste` roles exist, but a native key
equivalent is resolved in `performKeyEquivalent` before web content sees the
keystroke, so an Edit menu risks shadowing Excalidraw's canvas undo. WKWebView
already handles ⌘Z/⌘C/⌘V inside web content unaided.

No Window > Close. That role claims ⌘W, which `tab-strip.tsx` already uses to
close a tab.

No confirm when quitting with unsaved edits. `Utils.quit` reads the `beforeQuit`
veto synchronously, immediately after emitting the event, so an async round-trip
to the renderer's `confirmAction` cannot answer in time. Quitting therefore drops
up to `SAVE_DELAY` (800 ms) of un-flushed edits. Left as a known ceiling with a
`ponytail:` comment; the fix, if it ever matters, is shrinking the debounce or
flushing on blur — not a dialog.

## Step 2 — Double-click the title bar to zoom (~1 h)

**Contract.** `WindowBridge { toggleMaximize(): Promise<void> }` joins `FsBridge`
and `SettingsBridge` in `apps/web/src/shared/api/fs/types.ts`, and `DesktopApi`
becomes the intersection of all three. `DesktopRequests` is derived from
`DesktopApi`, so the bun process type-checks against the same contract for free.
`shared/api/fs/index.ts` exports `desktopWindow: WindowBridge | null`, null in
the browser build exactly like `desktopSettings`.

**Bun.** New `apps/desktop/src/bun/window-service.ts`. The window is constructed
*with* its RPC handlers, so the service cannot hold it at construction time: it
keeps a module-level ref and `index.ts` calls `attachWindow(mainWindow)` on the
next line. The body is one branch — `isMaximized() ? unmaximize() : maximize()`.

**Renderer.** `onDoubleClick` on the title bar root in `widgets/title-bar`,
guarded by `event.target.closest('.electrobun-webkit-app-region-no-drag')` — the
same test the preload uses to decide whether a drag starts. Tabs, the nav arrows
and the settings button already sit under that class, so `TabItem`'s own
double-click (promote a preview tab) is untouched.

Leaves behind `window-service.test.ts`: a fake window, assert the first toggle
maximizes and the second restores.

## Step 3 — No native context menu (~10 min)

One effect in `app/ui/app.tsx` adding a document-level `contextmenu` listener
that calls `preventDefault`.

App menus are unaffected. Base UI's `ContextMenu` and Excalidraw's canvas menu
attach their own listeners and `preventDefault` themselves; both listeners still
run, and the native menu is suppressed by either one.

Blanket, including text fields — they lose the native copy/paste/spellcheck menu
while ⌘C/⌘V keep working. Recorded in a `ponytail:` comment so the trade-off
reads as a decision.

## Step 4 — Right-click a tab (~4 h)

```
Close                ⌘W
Close Others              hidden when only one tab is open
Close All
──────────
Save As…                  hidden when the tab is inactive and has no file yet
```

New slice `features/tab-context-menu`, shaped like the existing
`features/file-tree-context-menu`: a `model/use-tab-actions.ts` and a
`ui/tab-menu.tsx` wrapping `TabItem` in the shared `ContextMenu`.

### Closing

`tab-store.ts` gains `closeMany(ids)`. Both `close(id)` and `dropUnder(path)`
delegate to it — they each carry their own copy of the "which tab becomes active
now" rule today, so this removes a duplicate rather than adding a third.

One counted confirm covers a whole batch: *"Close 3 sketches without saving?"*
with the names in the detail line. `useCloseTab` moves out of `tab-strip.tsx`
into the new slice, and the ⌘W handler, the ✕ button and the menu all route
through it, so closing a single tab behaves exactly as it does now.

Extends `tab-store.test.ts`: the active tab closed, the active tab surviving, and
close-all leaving `activeTabId` null.

### Save As…

Needs a destination, and there is no `NSSavePanel` to ask for one. New
`shared/ui/save-as-dialog.tsx`, built the same way `ConfirmDialog` is — a promise
resolved by a zustand store, mounted once in the app shell — offering a name
field and a folder row whose "Choose…" button calls the existing
`fs.pickDirectory()`. Defaults to the tab's current folder and title.

The scene content comes from one of two places: the active tab serializes from
the live editor, any other tab is read off disk. `serialize()` moves out of
`canvas-stage.tsx`, where it is currently inline, into `editor-store.ts` so both
callers share one implementation. A tab that is neither active nor yet saved has
no content to write, so the menu item is hidden for it.

An existing file at the destination is caught with `fs.exists` and a
`confirmAction("Replace …?")` — no new UI. On success the tab retargets to the
new path and the vault tree refreshes, so the tab follows the file the way an
editor's Save As does.

## Not doing

Tab reordering, "Close to the Right", middle-click-to-close, and "Reveal in
Finder" on the tab menu. None were asked for, and each wants its own decision
about drag affordances or menu length.
