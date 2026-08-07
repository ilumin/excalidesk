import { useEffect } from "react";
import { create } from "zustand";

interface FocusState {
  /** Hides the title bar and sidebar so the canvas fills the window. */
  focused: boolean;
  toggle: () => void;
  exit: () => void;
}

// Deliberately not persisted: focus mode is a moment, not a preference. A
// relaunch should never leave the user without a title bar.
export const useFocusStore = create<FocusState>((set, get) => ({
  focused: false,
  toggle: () => set({ focused: !get().focused }),
  exit: () => set({ focused: false }),
}));

const isTyping = (target: EventTarget | null) => {
  const element = target as HTMLElement | null;
  return (
    element?.isContentEditable === true ||
    /^(input|textarea|select)$/i.test(element?.tagName ?? "")
  );
};

/** Escape leaves focus mode. */
export function useFocusExitShortcut() {
  const focused = useFocusStore((state) => state.focused);
  const exit = useFocusStore((state) => state.exit);

  useEffect(() => {
    if (!focused) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      // Excalidraw stops propagation on its own container, so this has to run in
      // the capture phase — which means guarding the cases where Escape belongs
      // to the editor: its text editor, modals, and dropdowns. Both selectors
      // only exist in the DOM while something is actually open.
      if (isTyping(event.target)) return;
      if (document.querySelector(".excalidraw-modal-container, .dropdown-menu")) return;
      exit();
    };
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [exit, focused]);
}
