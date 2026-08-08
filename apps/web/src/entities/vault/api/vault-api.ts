import { fs, type FsNode } from "@/shared/api/fs";
import { basename } from "@/shared/lib";

import type { VaultSnapshot } from "../model/types";

/** Validates a folder and indexes it. Renderer code never calls `fs` directly. */
export async function readVault(path: string): Promise<VaultSnapshot> {
  const name = basename(path);
  if (!(await fs.exists(path))) {
    return { path, name, tree: [], status: "missing" };
  }
  const tree: FsNode[] = await fs.readTree(path);
  return { path, name, tree, status: "ready" };
}

export const pickVaultFolder = () => fs.pickDirectory();
export const pickSketchFile = () => fs.pickFile([".excalidraw"]);

export const createSketch = (parentPath: string, name: string) => fs.createFile(parentPath, name);
export const createFolder = (parentPath: string, name: string) =>
  fs.createDirectory(parentPath, name);
export const renameEntry = (path: string, nextName: string) => fs.rename(path, nextName);
export const moveEntry = (path: string, nextParentPath: string) => fs.move(path, nextParentPath);
export const trashEntry = (path: string) => fs.trash(path);
export const revealEntry = (path: string) => fs.reveal(path);
