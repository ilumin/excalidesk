import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { app } from "electron";

import type { SettingsBridge } from "@web/shared/api/fs/types";

/** `~/Library/Application Support/excalidesk/settings.json`. */
const folder = () => app.getPath("userData");

/**
 * ponytail: one JSON blob rewritten per change — it holds a handful of keys.
 *
 * Electron's `localStorage` does persist, unlike electrobun's `views://`, but
 * `persist.ts` is already built around this bridge and works. Not worth a rewrite.
 */
export const settingsService: SettingsBridge = {
  async readSettings() {
    return readFile(join(folder(), "settings.json"), "utf8").then(
      (raw) => JSON.parse(raw) as Record<string, unknown>,
      () => ({}),
    );
  },

  async writeSettings(settings) {
    await mkdir(folder(), { recursive: true });
    await writeFile(join(folder(), "settings.json"), JSON.stringify(settings), "utf8");
  },
};
