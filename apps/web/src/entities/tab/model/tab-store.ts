import { create } from "zustand";

import { basename, loadSetting, saveSetting, stripExtension } from "@/shared/lib";

export interface Tab {
  id: string;
  filePath: string;
  title: string;
  isDirty: boolean;
  /** VS Code-style preview: italic, and the next single click reuses this slot. */
  preview: boolean;
  /**
   * Never written to disk. A new sketch has no file until its first save, which
   * is what tells an untitled tab apart from one whose file was deleted.
   */
  isNew?: boolean;
  /** Had a file, and it is gone. Saving is held until the user asks for it. */
  missing?: boolean;
}

export type OpenMode = "preview" | "permanent";

interface TabState {
  tabs: Tab[];
  activeTabId: string | null;
  open: (filePath: string, mode?: OpenMode) => void;
  activate: (id: string) => void;
  close: (id: string) => void;
  /** Closes a whole batch at once, as "Close Others" and "Close All" do. */
  closeMany: (ids: string[]) => void;
  /** Promotes a preview tab to a kept one, as editing or double-click does. */
  keep: (id: string) => void;
  createUntitled: (parentPath: string) => void;
  setDirty: (id: string, isDirty: boolean) => void;
  /** The file is not on disk and the tab expected it to be. */
  setMissing: (id: string, missing: boolean) => void;
  /** A successful write: no longer new, no longer missing, no longer dirty. */
  markSaved: (id: string) => void;
  /**
   * Follows an entry that moved on disk, including every tab inside a renamed
   * or moved directory. Without this the canvas keeps writing to the old path
   * and recreates the file it was just renamed away from.
   */
  retarget: (fromPath: string, toPath: string) => void;
  /** Closes tabs for a deleted entry and anything that was inside it. */
  dropUnder: (path: string) => void;
  reset: (tabs: Tab[], activeTabId?: string | null) => void;
}

/** True for the entry itself and anything nested below it. */
const isAtOrUnder = (path: string, base: string) =>
  path === base || path.startsWith(`${base}/`);

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
    get().closeMany([id]);
  },

  closeMany(ids) {
    const { tabs, activeTabId } = get();
    const doomed = new Set(ids);
    const nextTabs = tabs.filter((tab) => !doomed.has(tab.id));
    if (nextTabs.length === tabs.length) return;

    // Losing the active tab hands focus to whatever now sits in its place, or
    // to the last tab when it was the trailing one.
    const index = tabs.findIndex((tab) => tab.id === activeTabId);
    persist(nextTabs);
    set({
      tabs: nextTabs,
      activeTabId:
        activeTabId && doomed.has(activeTabId)
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
    // `isNew` until the first write — an absent file is expected, not a loss.
    const next = { ...tabFor(`${parentPath}/${name}.excalidraw`, false, true), isNew: true };
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

  setMissing(id, missing) {
    const { tabs } = get();
    // Opening a tab re-checks the file, so bail unless the answer changed.
    if (!tabs.some((tab) => tab.id === id && (tab.missing ?? false) !== missing)) return;
    const nextTabs = tabs.map((tab) => (tab.id === id ? { ...tab, missing } : tab));
    persist(nextTabs);
    set({ tabs: nextTabs });
  },

  markSaved(id) {
    const nextTabs = get().tabs.map((tab) =>
      tab.id === id ? { ...tab, isDirty: false, isNew: false, missing: false } : tab,
    );
    persist(nextTabs);
    set({ tabs: nextTabs });
  },

  retarget(fromPath, toPath) {
    const { tabs, activeTabId } = get();
    if (!tabs.some((tab) => isAtOrUnder(tab.filePath, fromPath))) return;

    // Suffix swap rather than basename juggling, so nesting survives a move.
    const moved = (path: string) => toPath + path.slice(fromPath.length);
    const nextTabs = tabs.map((tab) =>
      isAtOrUnder(tab.filePath, fromPath)
        ? { ...tab, ...tabFor(moved(tab.filePath), tab.preview, tab.isDirty) }
        : tab,
    );

    persist(nextTabs);
    set({
      tabs: nextTabs,
      activeTabId:
        activeTabId && isAtOrUnder(activeTabId, fromPath) ? moved(activeTabId) : activeTabId,
    });
  },

  dropUnder(path) {
    get().closeMany(
      get()
        .tabs.filter((tab) => isAtOrUnder(tab.filePath, path))
        .map((tab) => tab.id),
    );
  },

  reset(tabs, activeTabId) {
    persist(tabs);
    set({ tabs, activeTabId: activeTabId ?? tabs[0]?.id ?? null });
  },
}));
