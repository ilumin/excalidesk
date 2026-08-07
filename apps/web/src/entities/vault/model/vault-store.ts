import { create } from "zustand";

import type { FsNode } from "@/shared/api/fs";
import { basename, loadSetting, saveSetting } from "@/shared/lib";

import { readVault } from "../api/vault-api";
import type { RecentFolder, VaultStatus } from "./types";

interface VaultState {
  status: VaultStatus;
  path: string | null;
  name: string;
  tree: FsNode[];
  recentFolders: RecentFolder[];
  /** False until the persisted folder has been validated — screens wait on this. */
  booted: boolean;
  boot: () => Promise<void>;
  open: (path: string) => Promise<void>;
  /** Re-index on window focus; a folder that vanished drops back to `missing`. */
  refresh: () => Promise<void>;
}

const LAST_FOLDER = "lastFolderPath";
const RECENTS = "recentFolders";

function remember(recents: RecentFolder[], path: string, missing: boolean): RecentFolder[] {
  const next: RecentFolder = {
    path,
    name: basename(path),
    lastOpenedAt: Date.now(),
    ...(missing ? { missing: true } : {}),
  };
  const rest = recents.filter((entry) => entry.path !== path);
  return [next, ...rest].slice(0, 8);
}

export const useVaultStore = create<VaultState>((set, get) => ({
  status: "none",
  path: null,
  name: "",
  tree: [],
  recentFolders: loadSetting<RecentFolder[]>(RECENTS, []),
  booted: false,

  async boot() {
    const path = loadSetting<string | null>(LAST_FOLDER, null);
    if (!path) {
      set({ status: "none", booted: true });
      return;
    }
    const snapshot = await readVault(path);
    const recentFolders = remember(get().recentFolders, path, snapshot.status === "missing");
    saveSetting(RECENTS, recentFolders);
    set({ ...snapshot, recentFolders, booted: true });
  },

  async open(path) {
    const snapshot = await readVault(path);
    const recentFolders = remember(get().recentFolders, path, snapshot.status === "missing");
    saveSetting(LAST_FOLDER, path);
    saveSetting(RECENTS, recentFolders);
    set({ ...snapshot, recentFolders, booted: true });
  },

  async refresh() {
    const { path } = get();
    if (!path) return;
    set(await readVault(path));
  },
}));
