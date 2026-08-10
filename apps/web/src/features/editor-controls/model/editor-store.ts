import { loadLibraryFromBlob, serializeAsJSON } from "@excalidraw/excalidraw";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { create } from "zustand";

import { fs } from "@/shared/api/fs";
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
  /** The live scene as it would be written to disk; null with no editor up. */
  serialize: () => string | null;
  toggleLibrary: () => void;
  /** Merges a `.excalidrawlib` file from disk into the library. */
  importLibrary: () => Promise<void>;
  toggleSearch: () => void;
  exportPng: (name: string) => void;
  resetScene: () => Promise<void>;
  toggleCompact: () => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  api: null,
  compact: loadSetting(COMPACT, true),
  setApi: (api) => set({ api }),

  serialize: () => {
    const api = get().api;
    if (!api) return null;
    // `serializeAsJSON` strips transient state, so the same scene serializes
    // identically twice — which is what lets the autosave skip a no-op write.
    return serializeAsJSON(api.getSceneElements(), api.getAppState(), api.getFiles(), "local");
  },

  // `library` and `search` are tabs inside Excalidraw's `default` sidebar —
  // they are not sidebar names of their own.
  toggleLibrary: () => get().api?.toggleSidebar({ name: "default", tab: "library" }),
  toggleSearch: () => get().api?.toggleSidebar({ name: "default", tab: "search" }),

  /**
   * Excalidraw's own "Browse libraries" link hands the library back by
   * navigating to `libraryReturnUrl` with the data in the hash — a round trip a
   * `views://` or `app://` renderer cannot receive. Until a custom URL scheme
   * exists on both shells, the user downloads the file and imports it here.
   *
   * `updateLibrary` fires `onLibraryChange`, so the merged set persists itself.
   */
  importLibrary: async () => {
    const api = get().api;
    if (!api) return;
    const path = await fs.pickFile([".excalidrawlib", ".excalidraw"]);
    if (!path) return;
    const raw = await fs.readFile(path);
    if (raw === null) return;
    try {
      const libraryItems = await loadLibraryFromBlob(new Blob([raw], { type: "application/json" }));
      await api.updateLibrary({ libraryItems, merge: true, openLibraryMenu: true });
    } catch {
      await confirmAction("That file is not an Excalidraw library.", {
        detail: "Expected a .excalidrawlib file, or a .excalidraw scene with library items.",
      });
    }
  },

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
