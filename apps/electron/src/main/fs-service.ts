import { mkdir, readdir, readFile, rename, stat, writeFile } from "node:fs/promises";
import { basename, dirname, isAbsolute, join, relative, resolve } from "node:path";

import type { OpenDialogOptions } from "electron";

import type { FsBridge, FsNode } from "@web/shared/api/fs/types";

const SKETCH_EXT = ".excalidraw";

/**
 * ponytail: imported lazily so `bun test` never resolves `electron` outside the
 * Electron runtime, where the package's entry point is a path string rather
 * than the API. The six pure `node:fs` methods stay testable as a result.
 */
const electron = () => import("electron");

/**
 * Sheet-modal on the one window this app has; a free-floating panel if the
 * picker somehow outlives it.
 */
async function open(options: OpenDialogOptions) {
  const { BrowserWindow, dialog } = await electron();
  const window = BrowserWindow.getAllWindows()[0];
  return window ? dialog.showOpenDialog(window, options) : dialog.showOpenDialog(options);
}

/** Set by `readTree`, which the renderer always calls before any mutation. */
let vaultRoot: string | null = null;

const exists = (path: string) => stat(path).then(() => true, () => false);

/**
 * The trust boundary: paths arrive from web code, so every write resolves
 * against the open vault and must land strictly inside it.
 */
function inVault(path: string): string {
  const target = resolve(path);
  const rel = vaultRoot ? relative(vaultRoot, target) : "";
  if (!vaultRoot || rel === "" || rel.startsWith("..") || isAbsolute(rel)) {
    throw new Error(`Refused: ${path} is outside the open vault`);
  }
  return target;
}

/** `inVault` plus "don't clobber what's already there". */
async function claim(path: string): Promise<string> {
  const target = inVault(path);
  if (await exists(target)) throw new Error(`Refused: ${target} already exists`);
  return target;
}

/** Directories and sketches only, directories first then by name. */
async function walk(dir: string): Promise<FsNode[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const nodes = await Promise.all(
    entries
      .filter((e) => !e.name.startsWith(".") && (e.isDirectory() || e.name.endsWith(SKETCH_EXT)))
      .map(async (e): Promise<FsNode> => {
        const path = join(dir, e.name);
        return e.isDirectory()
          ? { name: e.name, path, kind: "directory", children: await walk(path) }
          : { name: e.name, path, kind: "file" };
      }),
  );
  return nodes.sort((a, b) =>
    a.kind === b.kind ? a.name.localeCompare(b.name) : a.kind === "directory" ? -1 : 1,
  );
}

export const fsService: FsBridge = {
  async pickDirectory() {
    const { canceled, filePaths } = await open({
      properties: ["openDirectory", "createDirectory"],
    });
    return canceled ? null : (filePaths[0] ?? null);
  },

  async pickFile(extensions) {
    const { canceled, filePaths } = await open({
      properties: ["openFile"],
      filters: [{ name: "Sketches", extensions: extensions.map((ext) => ext.replace(/^\./, "")) }],
    });
    return canceled ? null : (filePaths[0] ?? null);
  },

  exists,

  async readTree(path) {
    vaultRoot = resolve(path);
    return walk(vaultRoot);
  },

  readFile(path) {
    return readFile(path, "utf8").then(
      (contents) => contents,
      () => null,
    );
  },

  async writeFile(path, contents) {
    const target = inVault(path);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, contents, "utf8");
  },

  async createFile(parentPath, name) {
    const target = await claim(join(parentPath, name));
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, "", "utf8");
    return { name: basename(target), path: target, kind: "file" };
  },

  async createDirectory(parentPath, name) {
    const target = await claim(join(parentPath, name));
    await mkdir(target);
    return { name: basename(target), path: target, kind: "directory", children: [] };
  },

  async rename(path, nextName) {
    const from = inVault(path);
    await rename(from, await claim(join(dirname(from), nextName)));
  },

  async move(path, nextParentPath) {
    const from = inVault(path);
    const to = await claim(join(nextParentPath, basename(from)));
    await rename(from, to);
    return to;
  },

  async trash(path) {
    await (await electron()).shell.trashItem(inVault(path));
  },

  async reveal(path) {
    (await electron()).shell.showItemInFolder(resolve(path));
  },
};
