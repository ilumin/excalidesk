import { expect, test } from "bun:test";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { fsService } from "./fs-service";

async function vault() {
  const root = await mkdtemp(join(tmpdir(), "excalidesk-"));
  await mkdir(join(root, "Work"));
  await mkdir(join(root, ".git"));
  await writeFile(join(root, "Work", "b.excalidraw"), "{}");
  await writeFile(join(root, "Work", "a.excalidraw"), "{}");
  await writeFile(join(root, "notes.txt"), "ignored");
  await writeFile(join(root, "zeta.excalidraw"), "{}");
  return root;
}

test("readTree keeps sketches and directories, directories first", async () => {
  const root = await vault();
  const tree = await fsService.readTree(root);

  expect(tree.map((node) => node.name)).toEqual(["Work", "zeta.excalidraw"]);
  expect(tree[0]?.children?.map((node) => node.name)).toEqual([
    "a.excalidraw",
    "b.excalidraw",
  ]);
});

test("writes outside the vault are refused", async () => {
  const root = await vault();
  await fsService.readTree(root);

  expect(fsService.createFile(root, "../escape.excalidraw")).rejects.toThrow(/outside/);
  expect(fsService.rename(join(root, "zeta.excalidraw"), "../escape.excalidraw")).rejects.toThrow(
    /outside/,
  );
  expect(fsService.createFile(root, "zeta.excalidraw")).rejects.toThrow(/already exists/);
});
