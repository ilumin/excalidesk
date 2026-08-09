import { Plus } from "lucide-react";
import { useCallback, useEffect } from "react";

import { TabItem, useTabStore } from "@/entities/tab";
import { useVaultStore } from "@/entities/vault";
import { IconButton, confirmAction } from "@/shared/ui";

function useCloseTab() {
  const close = useTabStore((state) => state.close);
  return useCallback(
    async (id: string) => {
      const tab = useTabStore.getState().tabs.find((candidate) => candidate.id === id);
      if (tab?.isDirty) {
        // Confirming closes and loses the edits, so the copy says exactly that
        // rather than asking about saving and then not saving.
        const discard = await confirmAction(`Close ${tab.title} without saving?`, {
          detail: "The edits since the last save will be lost.",
          confirmLabel: "Discard changes",
        });
        if (!discard) return;
      }
      close(id);
    },
    [close],
  );
}

export function TabStrip() {
  const tabs = useTabStore((state) => state.tabs);
  const activeTabId = useTabStore((state) => state.activeTabId);
  const activate = useTabStore((state) => state.activate);
  const keep = useTabStore((state) => state.keep);
  const createUntitled = useTabStore((state) => state.createUntitled);
  const vaultPath = useVaultStore((state) => state.path);
  const closeTab = useCloseTab();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "w" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        const { activeTabId: current } = useTabStore.getState();
        if (current) void closeTab(current);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeTab]);

  return (
    <div className="flex min-w-0 flex-1 items-center gap-[3px] overflow-hidden">
      {tabs.map((tab) => (
        <TabItem
          key={tab.id}
          tab={tab}
          active={tab.id === activeTabId}
          onActivate={() => activate(tab.id)}
          onKeep={() => keep(tab.id)}
          onClose={() => void closeTab(tab.id)}
        />
      ))}
      <IconButton
        className="ml-0.5"
        aria-label="New sketch"
        onClick={() => createUntitled(vaultPath ?? "")}
      >
        <Plus size={14} strokeWidth={1.6} />
      </IconButton>
    </div>
  );
}
