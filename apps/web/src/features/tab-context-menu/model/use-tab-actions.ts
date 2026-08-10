import { useCallback, useMemo } from "react";

import { SKETCH_EXTENSION, writeSketch } from "@/entities/sketch-file";
import { type Tab, useTabStore } from "@/entities/tab";
import { useVaultStore } from "@/entities/vault";
import { useEditorStore } from "@/features/editor-controls";
import { fs } from "@/shared/api/fs";
import { basename, parentPath } from "@/shared/lib";
import { confirmAction, saveAsAction } from "@/shared/ui";

const byId = (ids: string[]) => {
  const wanted = new Set(ids);
  return useTabStore.getState().tabs.filter((tab) => wanted.has(tab.id));
};

/**
 * One confirm for a whole batch, rather than one sheet per dirty tab. The copy
 * says the edits are lost because that is what closing does — it does not offer
 * to save and then not save.
 */
async function confirmDiscard(tabs: Tab[]): Promise<boolean> {
  const dirty = tabs.filter((tab) => tab.isDirty);
  const [only] = dirty;
  if (!only) return true;
  return confirmAction(
    dirty.length === 1
      ? `Close ${only.title} without saving?`
      : `Close ${dirty.length} sketches without saving?`,
    {
      detail:
        dirty.length === 1
          ? "The edits since the last save will be lost."
          : `${dirty.map((tab) => tab.title).join(", ")} — the edits since the last save will be lost.`,
      confirmLabel: "Discard changes",
    },
  );
}

/**
 * The scene as it should be written: live from the editor for the tab on
 * screen, off disk for any other. Null when neither can answer — a tab that is
 * neither active nor ever saved has nothing to copy.
 */
async function contentOf(tab: Tab): Promise<string | null> {
  if (tab.id === useTabStore.getState().activeTabId) {
    const live = useEditorStore.getState().serialize();
    if (live !== null) return live;
  }
  return fs.readFile(tab.filePath);
}

export function useTabActions() {
  const refresh = useVaultStore((state) => state.refresh);

  const closeTabs = useCallback(async (ids: string[]) => {
    const tabs = byId(ids);
    if (tabs.length === 0) return;
    if (!(await confirmDiscard(tabs))) return;
    useTabStore.getState().closeMany(ids);
  }, []);

  const closeOthers = useCallback(
    (keepId: string) =>
      closeTabs(
        useTabStore
          .getState()
          .tabs.filter((tab) => tab.id !== keepId)
          .map((tab) => tab.id),
      ),
    [closeTabs],
  );

  const closeAll = useCallback(
    () => closeTabs(useTabStore.getState().tabs.map((tab) => tab.id)),
    [closeTabs],
  );

  const saveAs = useCallback(
    async (id: string) => {
      const tab = useTabStore.getState().tabs.find((candidate) => candidate.id === id);
      if (!tab) return;

      const chosen = await saveAsAction({
        name: tab.title,
        folder: parentPath(tab.filePath),
      });
      if (!chosen) return;

      const file = chosen.name.endsWith(SKETCH_EXTENSION)
        ? chosen.name
        : chosen.name + SKETCH_EXTENSION;
      const target = `${chosen.folder}/${file}`;
      if (target === tab.filePath) return;

      if (await fs.exists(target)) {
        const replace = await confirmAction(`Replace "${basename(target)}"?`, {
          detail: "The existing sketch will be overwritten.",
          confirmLabel: "Replace",
        });
        if (!replace) return;
      }

      const contents = await contentOf(tab);
      if (contents === null) return;

      await writeSketch(target, contents);
      // Before the refresh, so no render sees the tab on the old path. The tab
      // follows the file, the way an editor's Save As does, and `markSaved`
      // clears the `isNew` flag a never-saved sketch was still carrying.
      useTabStore.getState().retarget(tab.filePath, target);
      useTabStore.getState().markSaved(target);
      await refresh();
    },
    [refresh],
  );

  return useMemo(
    () => ({ closeTabs, closeOthers, closeAll, saveAs }),
    [closeAll, closeOthers, closeTabs, saveAs],
  );
}
