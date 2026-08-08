import { create } from "zustand";

import { basename, loadSetting, saveSetting, stripExtension } from "@/shared/lib";

export interface Tab {
  id: string;
  filePath: string;
  title: string;
  isDirty: boolean;
  /** VS Code-style preview: italic, and the next single click reuses this slot. */
  preview: boolean;
}

export type OpenMode = "preview" | "permanent";

interface TabState {
  tabs: Tab[];
  activeTabId: string | null;
  open: (filePath: string, mode?: OpenMode) => void;
  activate: (id: string) => void;
  close: (id: string) => void;
  /** Promotes a preview tab to a kept one, as editing or double-click does. */
  keep: (id: string) => void;
  createUntitled: (parentPath: string) => void;
  setDirty: (id: string, isDirty: boolean) => void;
  reset: (tabs: Tab[], activeTabId?: string | null) => void;
}

const OPEN_TABS = "openTabs";

const tabFor = (filePath: string, preview: boolean, isDirty = false): Tab => ({
  id: filePath,
  filePath,
  title: stripExtension(basename(filePath)),
  isDirty,
  preview,
});

function persist(tabs: Tab[]) {
  saveSetting(OPEN_TABS, tabs);
}

const initialTabs = loadSetting<Tab[]>(OPEN_TABS, []);

export const useTabStore = create<TabState>((set, get) => ({
  tabs: initialTabs,
  activeTabId: initialTabs[0]?.id ?? null,

  open(filePath, mode = "preview") {
    const { tabs } = get();

    const existing = tabs.find((tab) => tab.filePath === filePath);
    if (existing) {
      const nextTabs =
        mode === "permanent" && existing.preview
          ? tabs.map((tab) => (tab.id === existing.id ? { ...tab, preview: false } : tab))
          : tabs;
      if (nextTabs !== tabs) persist(nextTabs);
      set({ tabs: nextTabs, activeTabId: existing.id });
      return;
    }

    const next = tabFor(filePath, mode === "preview");
    // A preview tab is a single reusable slot: the next preview takes its place.
    const previewIndex = tabs.findIndex((tab) => tab.preview);
    const nextTabs =
      mode === "preview" && previewIndex >= 0
        ? tabs.map((tab, index) => (index === previewIndex ? next : tab))
        : [...tabs, next];

    persist(nextTabs);
    set({ tabs: nextTabs, activeTabId: next.id });
  },

  activate(id) {
    set({ activeTabId: id });
  },

  close(id) {
    const { tabs, activeTabId } = get();
    const index = tabs.findIndex((tab) => tab.id === id);
    if (index < 0) return;
    const nextTabs = tabs.filter((tab) => tab.id !== id);
    persist(nextTabs);
    set({
      tabs: nextTabs,
      activeTabId:
        activeTabId === id
          ? (nextTabs[Math.min(index, nextTabs.length - 1)]?.id ?? null)
          : activeTabId,
    });
  },

  keep(id) {
    const nextTabs = get().tabs.map((tab) => (tab.id === id ? { ...tab, preview: false } : tab));
    persist(nextTabs);
    set({ tabs: nextTabs });
  },

  createUntitled(parentPath) {
    const { tabs } = get();
    const taken = new Set(tabs.map((tab) => tab.title));
    let n = 1;
    while (taken.has(n === 1 ? "Untitled" : `Untitled ${n}`)) n += 1;
    const name = n === 1 ? "Untitled" : `Untitled ${n}`;
    const next = tabFor(`${parentPath}/${name}.excalidraw`, false, true);
    const nextTabs = [...tabs, next];
    persist(nextTabs);
    set({ tabs: nextTabs, activeTabId: next.id });
  },

  setDirty(id, isDirty) {
    const nextTabs = get().tabs.map((tab) =>
      // Editing a preview keeps it, so the work can't be replaced by a click.
      tab.id === id ? { ...tab, isDirty, preview: isDirty ? false : tab.preview } : tab,
    );
    persist(nextTabs);
    set({ tabs: nextTabs });
  },

  reset(tabs, activeTabId) {
    persist(tabs);
    set({ tabs, activeTabId: activeTabId ?? tabs[0]?.id ?? null });
  },
}));
