import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { Updater } from "electrobun/bun";

import type { LibraryBridge } from "@web/shared/api/fs/types";

/** `~/Library/Application Support/<identifier>/<channel>/library.excalidrawlib`. */
const file = async () => join(await Updater.appDataFolder(), "library.excalidrawlib");

/**
 * The library as one `.excalidrawlib` file the user can copy out or replace by
 * hand. Kept out of `settings.json`: items carry element data and base64 images,
 * and that blob is rewritten whole on every change.
 */
export const libraryService: LibraryBridge = {
  async readLibrary() {
    return readFile(await file(), "utf8").then(
      (raw) => raw,
      () => null,
    );
  },

  async writeLibrary(contents) {
    await mkdir(await Updater.appDataFolder(), { recursive: true });
    await writeFile(await file(), contents, "utf8");
  },
};
