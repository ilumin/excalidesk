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
import { confirmAction } from "@/shared/ui";

import { useDraftStore } from "./draft-store";

/**
 * Naming happens inline in the tree, the way a file explorer does it: these
 * actions only open the draft, and `commitDraft` is what touches disk.
 */
export function useTreeActions() {
  const refresh = useVaultStore((state) => state.refresh);
  const vaultPath = useVaultStore((state) => state.path);
  const startDraft = useDraftStore((state) => state.startDraft);
  const cancelDraft = useDraftStore((state) => state.cancelDraft);

  const newFile = useCallback(
    (parent: string) => startDraft({ mode: "create", parentPath: parent, kind: "file" }),
    [startDraft],
  );

  const newFolder = useCallback(
    (parent: string) => startDraft({ mode: "create", parentPath: parent, kind: "directory" }),
    [startDraft],
  );

  const rename = useCallback(
    (path: string) => startDraft({ mode: "rename", path, name: basename(path) }),
    [startDraft],
  );

  const commitDraft = useCallback(
    async (name: string) => {
      const { draft } = useDraftStore.getState();
      cancelDraft();
      if (!draft) return;

      if (draft.mode === "rename") {
        if (name === draft.name) return;
        await renameEntry(draft.path, name);
        // Before the refresh, so no render sees a tab pointing at the old path.
        useTabStore.getState().retarget(draft.path, `${parentPath(draft.path)}/${name}`);
      } else if (draft.kind === "directory") {
        await createFolder(draft.parentPath, name);
      } else {
        const file = name.endsWith(SKETCH_EXTENSION) ? name : name + SKETCH_EXTENSION;
        await createSketch(draft.parentPath, file);
      }

      await refresh();
    },
    [cancelDraft, refresh],
  );

  const remove = useCallback(
    async (path: string) => {
      const confirmed = await confirmAction(`Move "${basename(path)}" to the Trash?`, {
        detail: "You can put it back from the Trash.",
        confirmLabel: "Move to Trash",
      });
      if (!confirmed) return;
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
      commitDraft,
      cancelDraft,
      remove,
      reveal,
      /** Where a "New …" lands when invoked on a node rather than the header. */
      parentFor: (path: string, kind: "file" | "directory") =>
        kind === "directory" ? path : parentPath(path),
      vaultPath,
    }),
    [cancelDraft, commitDraft, newFile, newFolder, remove, rename, reveal, vaultPath],
  );
}
