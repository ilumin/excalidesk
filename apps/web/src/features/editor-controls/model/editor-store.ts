import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { create } from "zustand";

import { loadSetting, saveSetting } from "@/shared/lib";

const COMPACT = "compactEditorUi";

interface EditorState {
  /** Handle to the mounted editor, published by widgets/canvas-stage. */
  api: ExcalidrawImperativeAPI | null;
  /** Shrinks Excalidraw's buttons and icons. */
  compact: boolean;
  setApi: (api: ExcalidrawImperativeAPI | null) => void;
  toggleLibrary: () => void;
  toggleCompact: () => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  api: null,
  compact: loadSetting(COMPACT, false),
  setApi: (api) => set({ api }),
  // `library` is a tab inside Excalidraw's `default` sidebar, not a sidebar name.
  toggleLibrary: () => get().api?.toggleSidebar({ name: "default", tab: "library" }),
  toggleCompact: () => {
    const compact = !get().compact;
    saveSetting(COMPACT, compact);
    set({ compact });
  },
}));
