import { join, relative } from "node:path";
import { pathToFileURL } from "node:url";

import { app, BrowserWindow, ipcMain, Menu, net, protocol } from "electron";

import type { DesktopApi } from "@web/shared/api/fs/types";

import { fsService } from "./fs-service";
import { settingsService } from "./settings-service";
import { windowService } from "./window-service";

const DEV_SERVER_URL = "http://localhost:3001";
const APP_URL = "app://mainview/index.html";

/**
 * `apps/electron` unpackaged, `…/Resources/app.asar` packaged. Not `__dirname`:
 * the bundler inlines that from the *source* path, which is off by a level.
 */
const root = () => app.getAppPath();

/**
 * Not `loadFile`: Vite emits `<script type="module" crossorigin>`, and a
 * `file://` document is an opaque origin, so every module request is blocked by
 * CORS and the window stays blank. A privileged scheme gives the page a real
 * origin — which also restores `localStorage` and `fetch`.
 *
 * Must run before `app.whenReady`.
 */
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { standard: true, secure: true, supportFetchAPI: true } },
]);

function serveBuiltAssets() {
  const dir = app.isPackaged ? join(root(), "web") : join(root(), "../web/dist");

  protocol.handle("app", (request) => {
    const path = join(dir, decodeURIComponent(new URL(request.url).pathname));
    // The renderer composes these URLs, but treat them as untrusted anyway.
    if (relative(dir, path).startsWith("..")) return new Response(null, { status: 403 });
    return net.fetch(pathToFileURL(path).toString());
  });
}

/** The dev server may still be booting when `dev:hmr` starts both at once. */
async function waitForDevServer(): Promise<boolean> {
  for (let attempt = 0; attempt < 20; attempt++) {
    try {
      await fetch(DEV_SERVER_URL, { method: "HEAD" });
      return true;
    } catch {
      await new Promise((done) => setTimeout(done, 500));
    }
  }
  console.log("Web dev server not running. Falling back to the built assets.");
  return false;
}

/** One handler per bridge method, applied from the argument tuple. */
function registerBridge() {
  const services: DesktopApi = { ...fsService, ...settingsService, ...windowService };
  for (const name of Object.keys(services) as (keyof DesktopApi)[]) {
    const method = services[name] as (...args: unknown[]) => unknown;
    ipcMain.handle(name, (_event, args: unknown[]) => method(...args));
  }
}

/**
 * No Edit menu on purpose — a native key equivalent wins in the responder chain,
 * before web content sees the keystroke, so `undo` would shadow Excalidraw's
 * canvas undo. Chromium already handles ⌘Z/⌘C/⌘V unaided. No Window > Close
 * either: that role claims ⌘W, which closes a tab here.
 *
 * ponytail: quitting is not gated on unsaved edits, so it can drop up to one
 * autosave debounce (800ms) of work. Flush on blur if that window ever matters.
 */
function setApplicationMenu() {
  Menu.setApplicationMenu(
    Menu.buildFromTemplate([
      {
        label: "Excalidesk",
        submenu: [
          { role: "about" },
          { type: "separator" },
          { role: "hide" },
          { role: "hideOthers" },
          { type: "separator" },
          { role: "quit" },
        ],
      },
    ]),
  );
}

async function createWindow() {
  const window = new BrowserWindow({
    title: "excalidesk",
    width: 1280,
    height: 820,
    x: 120,
    y: 120,
    show: false,
    // Native traffic lights, placed inside the 46px title bar the UI draws.
    titleBarStyle: "hiddenInset",
    trafficLightPosition: { x: 16, y: 16 },
    webPreferences: {
      preload: join(root(), "dist/preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  window.once("ready-to-show", () => window.show());

  if (process.env.ELECTRON_DEV && (await waitForDevServer())) {
    await window.loadURL(DEV_SERVER_URL);
    return;
  }

  await window.loadURL(APP_URL);
}

app.whenReady().then(async () => {
  registerBridge();
  serveBuiltAssets();
  setApplicationMenu();
  await createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) void createWindow();
  });
});

app.on("window-all-closed", () => app.quit());
