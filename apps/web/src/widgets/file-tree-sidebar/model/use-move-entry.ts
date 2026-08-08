import { useCallback } from "react";

import { useTabStore } from "@/entities/tab";
import { moveEntry, useVaultStore } from "@/entities/vault";
import { basename } from "@/shared/lib";

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
      expandFolder(nextParentPath);
      await refresh();

      // Any tab pointing at the moved file has to follow it.
      const { tabs, activeTabId, reset } = useTabStore.getState();
      const moved = tabs.map((tab) =>
        tab.filePath === path || tab.filePath.startsWith(`${path}/`)
          ? {
              ...tab,
              id: nextPath,
              filePath: tab.filePath === path ? nextPath : `${nextPath}/${basename(tab.filePath)}`,
            }
          : tab,
      );
      reset(moved, activeTabId === path ? nextPath : activeTabId);
    },
    [expandFolder, refresh],
  );
}
