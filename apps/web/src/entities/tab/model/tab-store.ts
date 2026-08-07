import { create } from "zustand";

import { basename, loadSetting, saveSetting, stripExtension } from "@/shared/lib";

export interface Tab {
  id: string;
  filePath: string;
  title: string;
  isDirty: boolean;
}

interface TabState {
  tabs: Tab[];
  activeTabId: string | null;
  /** Opens `filePath`, reusing an existing tab unless `inNewTab`. */
  open: (filePath: string, inNewTab?: boolean) => void;
  activate: (id: string) => void;
  close: (id: string) => void;
  createUntitled: (parentPath: string) => void;
  setDirty: (id: string, isDirty: boolean) => void;
  reset: (tabs: Tab[], activeTabId?: string | null) => void;
}

const OPEN_TABS = "openTabs";

const tabFor = (filePath: string, isDirty = false): Tab => ({
  id: filePath,
  filePath,
  title: stripExtension(basename(filePath)),
  isDirty,
});

function persist(tabs: Tab[]) {
  saveSetting(OPEN_TABS, tabs);
}

const initialTabs = loadSetting<Tab[]>(OPEN_TABS, []);

export const useTabStore = create<TabState>((set, get) => ({
  tabs: initialTabs,
  activeTabId: initialTabs[0]?.id ?? null,

  open(filePath, inNewTab = false) {
    const { tabs, activeTabId } = get();
    const existing = tabs.find((tab) => tab.filePath === filePath);
    if (existing) {
      set({ activeTabId: existing.id });
      return;
    }
    const next = tabFor(filePath);
    // A single click replaces the active tab unless it has unsaved work.
    const activeIndex = tabs.findIndex((tab) => tab.id === activeTabId);
    const replaceable = !inNewTab && activeIndex >= 0 && !tabs[activeIndex]?.isDirty;
    const nextTabs = replaceable
      ? tabs.map((tab, index) => (index === activeIndex ? next : tab))
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

  createUntitled(parentPath) {
    const { tabs } = get();
    const taken = new Set(tabs.map((tab) => tab.title));
    let n = 1;
    while (taken.has(n === 1 ? "Untitled" : `Untitled ${n}`)) n += 1;
    const name = n === 1 ? "Untitled" : `Untitled ${n}`;
    const next = tabFor(`${parentPath}/${name}.excalidraw`, true);
    const nextTabs = [...tabs, next];
    persist(nextTabs);
    set({ tabs: nextTabs, activeTabId: next.id });
  },

  setDirty(id, isDirty) {
    const nextTabs = get().tabs.map((tab) => (tab.id === id ? { ...tab, isDirty } : tab));
    persist(nextTabs);
    set({ tabs: nextTabs });
  },

  reset(tabs, activeTabId) {
    persist(tabs);
    set({ tabs, activeTabId: activeTabId ?? tabs[0]?.id ?? null });
  },
}));
