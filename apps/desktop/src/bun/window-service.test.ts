import { expect, test } from "bun:test";
import type { BrowserWindow } from "electrobun/bun";

import { attachWindow, windowService } from "./window-service";

/** Only the three members `toggleMaximize` reaches for. */
function fakeWindow() {
  const calls: string[] = [];
  let maximized = false;
  const window = {
    isMaximized: () => maximized,
    maximize: () => {
      calls.push("maximize");
      maximized = true;
    },
    unmaximize: () => {
      calls.push("unmaximize");
      maximized = false;
    },
  };
  attachWindow(window as unknown as BrowserWindow);
  return calls;
}

test("toggleMaximize zooms, then restores", async () => {
  const calls = fakeWindow();

  await windowService.toggleMaximize();
  await windowService.toggleMaximize();
  await windowService.toggleMaximize();

  expect(calls).toEqual(["maximize", "unmaximize", "maximize"]);
});

test("toggleMaximize before a window is attached is a no-op", async () => {
  attachWindow(null as unknown as BrowserWindow);
  expect(windowService.toggleMaximize()).resolves.toBeUndefined();
});
