import { Plus } from "lucide-react";
import { useCallback, useEffect } from "react";

import { TabItem, useTabStore } from "@/entities/tab";
import { useVaultStore } from "@/entities/vault";
import { IconButton } from "@/shared/ui";

function useCloseTab() {
  const close = useTabStore((state) => state.close);
  return useCallback(
    (id: string) => {
      const tab = useTabStore.getState().tabs.find((candidate) => candidate.id === id);
      // ponytail: native confirm covers "prompts to save"; swap for a sheet when
      // the save pipeline exists and needs a third "don't save" answer.
      if (tab?.isDirty && !window.confirm(`Save changes to ${tab.title} before closing?`)) return;
      close(id);
    },
    [close],
  );
}

export function TabStrip() {
  const tabs = useTabStore((state) => state.tabs);
  const activeTabId = useTabStore((state) => state.activeTabId);
  const activate = useTabStore((state) => state.activate);
  const createUntitled = useTabStore((state) => state.createUntitled);
  const vaultPath = useVaultStore((state) => state.path);
  const closeTab = useCloseTab();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "w" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        const { activeTabId: current } = useTabStore.getState();
        if (current) closeTab(current);
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
          onClose={() => closeTab(tab.id)}
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
