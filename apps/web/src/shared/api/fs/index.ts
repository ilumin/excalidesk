import { browserFs } from "./browser-fs";
import { createDesktopApi } from "./desktop-fs";
import type { DesktopApi, FsBridge, SettingsBridge, WindowBridge } from "./types";

declare global {
  interface Window {
    excalidesk?: { fs?: DesktopApi };
  }
}

/**
 * Two shells, one contract. Electron's preload hands the whole `DesktopApi` over
 * `contextBridge`; electrobun exposes `window.__electrobun` and the bridge is
 * built here. Neither, and this is a plain browser (or Storybook), which gets
 * the in-memory sample vault.
 */
const desktop: DesktopApi | null =
  globalThis.window?.excalidesk?.fs ??
  (globalThis.window?.__electrobun ? createDesktopApi() : null);

export const fs: FsBridge = desktop ?? browserFs;

/** False in the browser — the UI draws its own chrome there. */
export const isDesktop = desktop !== null;

/** Null in the browser, where `localStorage` already outlives the session. */
export const desktopSettings: SettingsBridge | null = desktop;

/** Null in the browser, which has no window chrome of its own to drive. */
export const desktopWindow: WindowBridge | null = desktop;

export type {
  DesktopApi,
  DesktopRequests,
  FsBridge,
  FsNode,
  FsNodeKind,
  SettingsBridge,
  WindowBridge,
} from "./types";
