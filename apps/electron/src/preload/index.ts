import { contextBridge, ipcRenderer } from "electron";

import type { DesktopApi } from "@web/shared/api/fs/types";

/**
 * The seam. `shared/api/fs/index.ts` picks `window.excalidesk.fs` up ahead of
 * everything else, so the renderer needs no knowledge of Electron.
 *
 * Sandboxed: `electron` is the only module importable here, and the type import
 * above is erased. Adding a `node:` import would break preload at load time.
 */
const call =
  <K extends keyof DesktopApi>(method: K): DesktopApi[K] =>
  // Arguments cross as one tuple so the main side can apply them directly.
  ((...args: unknown[]) => ipcRenderer.invoke(method, args)) as DesktopApi[K];

// Listed one per line rather than derived: a method added to `DesktopApi`
// fails to compile here until it is forwarded too.
const api: DesktopApi = {
  pickDirectory: call("pickDirectory"),
  pickFile: call("pickFile"),
  exists: call("exists"),
  readTree: call("readTree"),
  readFile: call("readFile"),
  writeFile: call("writeFile"),
  createFile: call("createFile"),
  createDirectory: call("createDirectory"),
  rename: call("rename"),
  move: call("move"),
  trash: call("trash"),
  reveal: call("reveal"),
  readSettings: call("readSettings"),
  writeSettings: call("writeSettings"),
  toggleMaximize: call("toggleMaximize"),
};

contextBridge.exposeInMainWorld("excalidesk", { fs: api });
