import { expect, test } from "bun:test";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { createLibraryService } from "./library-service";

async function service() {
  const folder = await mkdtemp(join(tmpdir(), "excalidesk-lib-"));
  return { folder, library: createLibraryService(async () => folder) };
}

test("reads back what it wrote", async () => {
  const { library } = await service();
  const json = JSON.stringify({ type: "excalidrawlib", version: 2, libraryItems: [] });

  await library.writeLibrary(json);

  expect(await library.readLibrary()).toBe(json);
});

test("a library that was never saved reads as null, not an error", async () => {
  const { library } = await service();

  expect(await library.readLibrary()).toBeNull();
});

test("the folder is created on first write", async () => {
  const parent = await mkdtemp(join(tmpdir(), "excalidesk-lib-"));
  const library = createLibraryService(async () => join(parent, "does-not-exist-yet"));

  await library.writeLibrary("{}");

  expect(await library.readLibrary()).toBe("{}");
});
