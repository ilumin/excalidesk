import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { create } from "zustand";

import { loadSetting, saveSetting } from "@/shared/lib";
import { confirmAction } from "@/shared/ui";

import { exportScenePng } from "../lib/export-scene";

const COMPACT = "compactEditorUi";

interface EditorState {
  /** Handle to the mounted editor, published by widgets/canvas-stage. */
  api: ExcalidrawImperativeAPI | null;
  /** Shrinks Excalidraw's buttons and icons. On by default. */
  compact: boolean;
  setApi: (api: ExcalidrawImperativeAPI | null) => void;
  toggleLibrary: () => void;
  toggleSearch: () => void;
  exportPng: (name: string) => void;
  resetScene: () => Promise<void>;
  toggleCompact: () => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  api: null,
  compact: loadSetting(COMPACT, true),
  setApi: (api) => set({ api }),

  // `library` and `search` are tabs inside Excalidraw's `default` sidebar —
  // they are not sidebar names of their own.
  toggleLibrary: () => get().api?.toggleSidebar({ name: "default", tab: "library" }),
  toggleSearch: () => get().api?.toggleSidebar({ name: "default", tab: "search" }),

  exportPng: (name) => {
    const api = get().api;
    if (api) void exportScenePng(api, name);
  },

  resetScene: async () => {
    const api = get().api;
    if (!api) return;
    const confirmed = await confirmAction("Clear this sketch?", {
      detail: "This can be undone with ⌘Z.",
      confirmLabel: "Clear",
    });
    if (!confirmed) return;
    api.resetScene();
    // resetScene restores Excalidraw's default white canvas; the dotted
    // background of the panel needs it transparent again.
    api.updateScene({ appState: { viewBackgroundColor: "transparent" } });
  },

  toggleCompact: () => {
    const compact = !get().compact;
    saveSetting(COMPACT, compact);
    set({ compact });
  },
}));
