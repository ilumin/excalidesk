import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import type { LibraryBridge } from "@web/shared/api/fs/types";

const FILE = "library.excalidrawlib";

/**
 * The library as one `.excalidrawlib` file the user can copy out or replace by
 * hand. Kept out of `settings.json`: items carry element data and base64 images,
 * and that blob is rewritten whole on every change.
 *
 * The folder is a parameter so a test can point it at a tmpdir — there is no
 * `userData` path outside a running Electron process.
 */
export function createLibraryService(folder: () => Promise<string>): LibraryBridge {
  return {
    async readLibrary() {
      return readFile(join(await folder(), FILE), "utf8").then(
        (raw) => raw,
        () => null,
      );
    },

    async writeLibrary(contents) {
      const dir = await folder();
      await mkdir(dir, { recursive: true });
      await writeFile(join(dir, FILE), contents, "utf8");
    },
  };
}

/**
 * `~/Library/Application Support/excalidesk/library.excalidrawlib`. Imported
 * lazily, like `fs-service` does: outside the Electron runtime the package's
 * entry point is a path string rather than the API, which would break `bun test`.
 */
export const libraryService = createLibraryService(async () =>
  (await import("electron")).app.getPath("userData"),
);
