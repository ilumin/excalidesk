import { create } from "zustand";

/**
 * A name being typed in the tree itself — the desktop-native way to rename or
 * create, and the reason none of this needs `window.prompt`.
 */
export type TreeDraft =
  | { mode: "rename"; path: string; name: string }
  | { mode: "create"; parentPath: string; kind: "file" | "directory" };

interface DraftState {
  /** At most one row is ever in edit mode. */
  draft: TreeDraft | null;
  startDraft: (draft: TreeDraft) => void;
  cancelDraft: () => void;
}

export const useDraftStore = create<DraftState>((set) => ({
  draft: null,
  startDraft: (draft) => set({ draft }),
  cancelDraft: () => set({ draft: null }),
}));
