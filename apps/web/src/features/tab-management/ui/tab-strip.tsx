import { Plus } from "lucide-react";
import { useEffect } from "react";

import { TabItem, useTabStore } from "@/entities/tab";
import { useVaultStore } from "@/entities/vault";
import { TabContextMenu, useTabActions } from "@/features/tab-context-menu";
import { IconButton } from "@/shared/ui";

export function TabStrip() {
  const tabs = useTabStore((state) => state.tabs);
  const activeTabId = useTabStore((state) => state.activeTabId);
  const activate = useTabStore((state) => state.activate);
  const keep = useTabStore((state) => state.keep);
  const createUntitled = useTabStore((state) => state.createUntitled);
  const vaultPath = useVaultStore((state) => state.path);
  // The ✕, ⌘W and the context menu all close through the same function, so a
  // single tab behaves identically however it is closed.
  const { closeTabs } = useTabActions();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "w" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        const { activeTabId: current } = useTabStore.getState();
        if (current) void closeTabs([current]);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeTabs]);

  return (
    <div className="flex min-w-0 flex-1 items-center gap-[3px] overflow-hidden">
      {tabs.map((tab) => (
        <TabContextMenu key={tab.id} tab={tab}>
          <TabItem
            tab={tab}
            active={tab.id === activeTabId}
            onActivate={() => activate(tab.id)}
            onKeep={() => keep(tab.id)}
            onClose={() => void closeTabs([tab.id])}
          />
        </TabContextMenu>
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
