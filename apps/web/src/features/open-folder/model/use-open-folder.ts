import { useCallback } from "react";

import { pickSketchFile, pickVaultFolder, useVaultStore } from "@/entities/vault";
import { useTabStore } from "@/entities/tab";
import { parentPath } from "@/shared/lib";

export function useOpenFolder() {
  const openVault = useVaultStore((state) => state.open);
  const closeVault = useVaultStore((state) => state.close);
  const openTab = useTabStore((state) => state.open);
  const resetTabs = useTabStore((state) => state.reset);

  const openFolder = useCallback(async () => {
    const path = await pickVaultFolder();
    if (!path) return;
    // Tabs point into the old folder, so they leave with it.
    resetTabs([]);
    await openVault(path);
  }, [openVault, resetTabs]);

  /**
   * ponytail: "Create new folder" reuses the directory picker — the native save
   * panel can make a folder inline. Swap for a dedicated create dialog if the
   * shell ever needs one.
   */
  const createNewFolder = openFolder;

  const openSingleFile = useCallback(async () => {
    const file = await pickSketchFile();
    if (!file) return;
    resetTabs([]);
    await openVault(parentPath(file));
    openTab(file, true);
  }, [openTab, openVault, resetTabs]);

  const openRecent = useCallback(
    async (path: string) => {
      resetTabs([]);
      await openVault(path);
    },
    [openVault, resetTabs],
  );

  const close = useCallback(() => {
    resetTabs([]);
    closeVault();
  }, [closeVault, resetTabs]);

  return { openFolder, createNewFolder, openSingleFile, openPath: openRecent, close };
}
