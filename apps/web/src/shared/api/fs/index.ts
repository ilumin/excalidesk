import { browserFs } from "./browser-fs";
import { createDesktopApi } from "./desktop-fs";
import type { FsBridge, SettingsBridge } from "./types";

declare global {
  interface Window {
    excalidesk?: { fs?: FsBridge };
  }
}

/**
 * `window.__electrobun` is injected by the desktop preload; without it this is a
 * plain browser (or Storybook), which gets the in-memory sample vault.
 */
const desktop = globalThis.window?.__electrobun ? createDesktopApi() : null;

export const fs: FsBridge = globalThis.window?.excalidesk?.fs ?? desktop ?? browserFs;

/** Null in the browser, where `localStorage` already outlives the session. */
export const desktopSettings: SettingsBridge | null = desktop;

export type {
  DesktopApi,
  DesktopRequests,
  FsBridge,
  FsNode,
  FsNodeKind,
  SettingsBridge,
} from "./types";
