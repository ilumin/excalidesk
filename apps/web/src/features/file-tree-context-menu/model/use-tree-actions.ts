import { useCallback, useMemo } from "react";

import {
  createFolder,
  createSketch,
  renameEntry,
  revealEntry,
  trashEntry,
  useVaultStore,
} from "@/entities/vault";
import { SKETCH_EXTENSION } from "@/entities/sketch-file";
import { useTabStore } from "@/entities/tab";
import { basename, parentPath } from "@/shared/lib";

/**
 * ponytail: `prompt`/`confirm` are the native affordances for a rename and a
 * destructive confirm. Replace with in-app dialogs only when the copy needs to
 * change; the call sites stay the same.
 */
export function useTreeActions() {
  const refresh = useVaultStore((state) => state.refresh);
  const vaultPath = useVaultStore((state) => state.path);

  const newFile = useCallback(
    async (parent: string) => {
      const name = window.prompt("New sketch name", `Untitled${SKETCH_EXTENSION}`);
      if (!name) return;
      await createSketch(parent, name.endsWith(SKETCH_EXTENSION) ? name : name + SKETCH_EXTENSION);
      await refresh();
    },
    [refresh],
  );

  const newFolder = useCallback(
    async (parent: string) => {
      const name = window.prompt("New folder name", "Untitled");
      if (!name) return;
      await createFolder(parent, name);
      await refresh();
    },
    [refresh],
  );

  const rename = useCallback(
    async (path: string) => {
      const next = window.prompt("Rename to", basename(path));
      if (!next || next === basename(path)) return;
      await renameEntry(path, next);
      // Before the refresh, so no render sees a tab pointing at the old path.
      useTabStore.getState().retarget(path, `${parentPath(path)}/${next}`);
      await refresh();
    },
    [refresh],
  );

  const remove = useCallback(
    async (path: string) => {
      if (!window.confirm(`Move "${basename(path)}" to the Trash?`)) return;
      await trashEntry(path);
      useTabStore.getState().dropUnder(path);
      await refresh();
    },
    [refresh],
  );

  const reveal = useCallback((path: string) => revealEntry(path), []);

  return useMemo(
    () => ({
      newFile,
      newFolder,
      rename,
      remove,
      reveal,
      /** Where a "New …" lands when invoked on a node rather than the header. */
      parentFor: (path: string, kind: "file" | "directory") =>
        kind === "directory" ? path : parentPath(path),
      vaultPath,
    }),
    [newFile, newFolder, remove, rename, reveal, vaultPath],
  );
}
