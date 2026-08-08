import { create } from "zustand";

import { loadSetting, saveSetting } from "@/shared/lib";

const KEY = "expandedFolderPaths";

interface TreeState {
  expanded: string[];
  /** The folder whose row shows the active ring + ⋯ button. */
  activeFolderPath: string | null;
  /** Path being dragged, and the folder currently under the pointer. */
  draggingPath: string | null;
  dropTargetPath: string | null;
  toggleFolder: (path: string) => void;
  expandFolder: (path: string) => void;
  setActiveFolder: (path: string | null) => void;
  setDragging: (path: string | null) => void;
  setDropTarget: (path: string | null) => void;
}

export const useTreeStore = create<TreeState>((set, get) => ({
  expanded: loadSetting<string[]>(KEY, []),
  activeFolderPath: null,
  draggingPath: null,
  dropTargetPath: null,

  toggleFolder: (path) => {
    const { expanded } = get();
    const next = expanded.includes(path)
      ? expanded.filter((entry) => entry !== path)
      : [...expanded, path];
    saveSetting(KEY, next);
    set({ expanded: next, activeFolderPath: path });
  },

  expandFolder: (path) => {
    const { expanded } = get();
    if (expanded.includes(path)) return;
    const next = [...expanded, path];
    saveSetting(KEY, next);
    set({ expanded: next });
  },

  setActiveFolder: (activeFolderPath) => set({ activeFolderPath }),
  setDragging: (draggingPath) => set({ draggingPath }),
  setDropTarget: (dropTargetPath) => set({ dropTargetPath }),
}));
