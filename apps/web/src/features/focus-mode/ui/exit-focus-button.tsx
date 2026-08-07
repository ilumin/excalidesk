import { Minimize2 } from "lucide-react";

import { useFocusStore } from "../model/focus-store";

/**
 * Bottom-centre is the one edge Excalidraw leaves free — its own controls sit
 * in all four corners and top-centre.
 */
export function ExitFocusButton() {
  const exit = useFocusStore((state) => state.exit);
  return (
    <button
      type="button"
      onClick={exit}
      className="absolute bottom-4 left-1/2 z-5 flex -translate-x-1/2 items-center gap-2 rounded-[8px] border border-ed-edge-strong bg-ed-surface py-1.5 pr-2 pl-2.5 text-[11.5px] text-ed-muted shadow-[var(--ed-island-shadow)] transition-colors duration-[120ms] hover:text-ed-ink"
    >
      <Minimize2 size={13} strokeWidth={1.5} />
      <span>Exit focus</span>
      <kbd className="rounded-[4px] bg-ed-hover px-1.5 py-0.5 font-mono-path text-[10px] text-ed-faint">
        esc
      </kbd>
    </button>
  );
}
