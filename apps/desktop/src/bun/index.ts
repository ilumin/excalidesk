import {
  ApplicationMenu,
  BrowserView,
  BrowserWindow,
  Updater,
  type RPCSchema,
} from "electrobun/bun";

import type { DesktopRequests } from "@web/shared/api/fs/types";

import { fsService } from "./fs-service";
import { settingsService } from "./settings-service";
import { attachWindow, windowService } from "./window-service";

const DEV_SERVER_PORT = 3001;
const DEV_SERVER_URL = `http://localhost:${DEV_SERVER_PORT}`;

type DesktopRPC = { bun: RPCSchema<{ requests: DesktopRequests }>; webview: RPCSchema };

async function getMainViewUrl(): Promise<string> {
  const channel = await Updater.localInfo.channel();
  if (channel === "dev") {
    try {
      await fetch(DEV_SERVER_URL, { method: "HEAD" });
      console.log(`HMR enabled: Using web dev server at ${DEV_SERVER_URL}`);
      return DEV_SERVER_URL;
    } catch {
      console.log("Web dev server not running. Run dev:hmr for live reload.");
    }
  }

  return "views://mainview/index.html";
}

const url = await getMainViewUrl();

// One request per bridge method, applied from the argument tuple.
// `DesktopRequests` keeps the wire contract honest; the cast only erases the
// loop's generics.
const requests = Object.fromEntries(
  Object.entries({ ...fsService, ...settingsService, ...windowService }).map(([name, method]) => [
    name,
    (args: unknown[]) => (method as (...a: unknown[]) => unknown)(...args),
  ]),
) as unknown as {
  [K in keyof DesktopRequests]: (
    params: DesktopRequests[K]["params"],
  ) => Promise<DesktopRequests[K]["response"]>;
};

const mainWindow = new BrowserWindow({
  title: "excalidesk",
  url,
  frame: {
    width: 1280,
    height: 820,
    x: 120,
    y: 120,
  },
  // Native traffic lights, placed inside the 46px title bar the UI draws.
  titleBarStyle: "hiddenInset",
  rpc: BrowserView.defineRPC<DesktopRPC>({ handlers: { requests } }),
});

mainWindow.setWindowButtonPosition(16, 16);
attachWindow(mainWindow);

/**
 * Without an application menu there is no ⌘Q, so the app can only be quit from
 * the Dock. Roles only: AppKit attaches the key equivalents itself.
 *
 * No Edit menu on purpose — a native key equivalent wins in
 * `performKeyEquivalent`, before web content sees the keystroke, so `undo` would
 * shadow Excalidraw's canvas undo. WKWebView already handles ⌘Z/⌘C/⌘V unaided.
 * No Window > Close either: that role claims ⌘W, which closes a tab here.
 *
 * ponytail: quitting is not gated on unsaved edits, so it can drop up to one
 * autosave debounce (800ms) of work. `Utils.quit` reads the `beforeQuit` veto
 * synchronously, so the renderer cannot be asked in time — shrink the debounce
 * or flush on blur if that window ever matters.
 */
ApplicationMenu.setApplicationMenu([
  {
    label: "Excalidesk",
    submenu: [
      { role: "about" },
      { type: "divider" },
      { role: "hide" },
      { role: "hideOthers" },
      { type: "divider" },
      { role: "quit" },
    ],
  },
]);

console.log("Electrobun desktop shell started.");
