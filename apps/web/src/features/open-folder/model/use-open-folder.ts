import { useCallback } from "react";

import { pickSketchFile, pickVaultFolder, useVaultStore } from "@/entities/vault";
import { useTabStore } from "@/entities/tab";
import { parentPath } from "@/shared/lib";

export function useOpenFolder() {
  const openVault = useVaultStore((state) => state.open);
  const openTab = useTabStore((state) => state.open);

  const openFolder = useCallback(async () => {
    const path = await pickVaultFolder();
    if (path) await openVault(path);
  }, [openVault]);

  /**
   * ponytail: "Create new folder" reuses the directory picker — the native save
   * panel can make a folder inline. Swap for a dedicated create dialog if the
   * shell ever needs one.
   */
  const createNewFolder = openFolder;

  const openSingleFile = useCallback(async () => {
    const file = await pickSketchFile();
    if (!file) return;
    await openVault(parentPath(file));
    openTab(file, true);
  }, [openTab, openVault]);

  return { openFolder, createNewFolder, openSingleFile, openPath: openVault };
}
