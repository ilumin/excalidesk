import { useCallback } from "react";

import { useTabStore } from "@/entities/tab";
import { moveEntry, useVaultStore } from "@/entities/vault";

import { useTreeStore } from "./tree-store";

/** True when `target` is `path` itself or lives inside it — an illegal move. */
const isInside = (path: string, target: string) => target === path || target.startsWith(`${path}/`);

export function useMoveEntry() {
  const refresh = useVaultStore((state) => state.refresh);
  const expandFolder = useTreeStore((state) => state.expandFolder);

  return useCallback(
    async (path: string, nextParentPath: string) => {
      const alreadyThere = path.slice(0, path.lastIndexOf("/")) === nextParentPath;
      if (alreadyThere || isInside(path, nextParentPath)) return;

      const nextPath = await moveEntry(path, nextParentPath);
      // Any tab pointing at the moved entry — or inside it — has to follow.
      useTabStore.getState().retarget(path, nextPath);
      expandFolder(nextParentPath);
      await refresh();
    },
    [expandFolder, refresh],
  );
}
