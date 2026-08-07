import { useEffect } from "react";
import { create } from "zustand";

import { loadSetting, saveSetting } from "@/shared/lib";

const KEY = "sidebarCollapsed";

interface SidebarState {
  collapsed: boolean;
  toggle: () => void;
  set: (collapsed: boolean) => void;
}

export const useSidebarStore = create<SidebarState>((set, get) => ({
  collapsed: loadSetting(KEY, false),
  toggle: () => {
    const collapsed = !get().collapsed;
    saveSetting(KEY, collapsed);
    set({ collapsed });
  },
  set: (collapsed) => {
    saveSetting(KEY, collapsed);
    set({ collapsed });
  },
}));

/** ⌘\ collapses or expands the sidebar. */
export function useSidebarShortcut() {
  const toggle = useSidebarStore((state) => state.toggle);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "\\" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        toggle();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggle]);
}
