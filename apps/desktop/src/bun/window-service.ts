import type { BrowserWindow } from "electrobun/bun";

import type { WindowBridge } from "@web/shared/api/fs/types";

/**
 * The window is constructed *with* its RPC handlers, so this service cannot be
 * handed the window at construction time — `index.ts` calls `attachWindow` on
 * the next line instead.
 */
let target: BrowserWindow | null = null;

export const attachWindow = (window: BrowserWindow) => {
  target = window;
};

export const windowService: WindowBridge = {
  async toggleMaximize() {
    if (!target) return;
    if (target.isMaximized()) target.unmaximize();
    else target.maximize();
  },
};
