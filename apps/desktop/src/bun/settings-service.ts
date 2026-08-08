import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { Updater } from "electrobun/bun";

import type { SettingsBridge } from "@web/shared/api/fs/types";

/** `~/Library/Application Support/<identifier>/<channel>/settings.json`. */
const file = async () => join(await Updater.appDataFolder(), "settings.json");

/** ponytail: one JSON blob rewritten per change — it holds a handful of keys. */
export const settingsService: SettingsBridge = {
  async readSettings() {
    return readFile(await file(), "utf8").then(
      (raw) => JSON.parse(raw) as Record<string, unknown>,
      () => ({}),
    );
  },

  async writeSettings(settings) {
    const folder = await Updater.appDataFolder();
    await mkdir(folder, { recursive: true });
    await writeFile(join(folder, "settings.json"), JSON.stringify(settings), "utf8");
  },
};
