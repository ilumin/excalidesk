import { create } from "zustand";

import { loadSetting, saveSetting } from "@/shared/lib";

const KEY = "expandedFolderPaths";

interface TreeState {
  expanded: string[];
  /** The folder whose row shows the active ring + ⋯ button. */
  activeFolderPath: string | null;
  toggleFolder: (path: string) => void;
  setActiveFolder: (path: string | null) => void;
}

export const useTreeStore = create<TreeState>((set, get) => ({
  expanded: loadSetting<string[]>(KEY, []),
  activeFolderPath: null,
  toggleFolder: (path) => {
    const { expanded } = get();
    const next = expanded.includes(path)
      ? expanded.filter((entry) => entry !== path)
      : [...expanded, path];
    saveSetting(KEY, next);
    set({ expanded: next, activeFolderPath: path });
  },
  setActiveFolder: (activeFolderPath) => set({ activeFolderPath }),
}));
