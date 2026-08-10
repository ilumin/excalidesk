import type { WindowBridge } from "@web/shared/api/fs/types";

export const windowService: WindowBridge = {
  /**
   * ponytail: a no-op on purpose. `-webkit-app-region: drag` gives macOS its
   * native double-click-to-zoom for free, and `title-bar.tsx` calls this from
   * its own `onDoubleClick` — doing the work here would toggle it straight back.
   *
   * If a platform ever fails to zoom natively, implement it here and guard the
   * renderer's handler instead.
   */
  async toggleMaximize() {},
};
