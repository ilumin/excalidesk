import { useEffect } from "react";
import { create } from "zustand";

import { TOOLS, type ToolId } from "@/entities/tool";

interface ToolState {
  activeTool: ToolId;
  zoom: number;
  select: (tool: ToolId) => void;
  setZoom: (zoom: number) => void;
}

const ZOOM_STEP = 10;

export const useToolStore = create<ToolState>((set) => ({
  activeTool: "select",
  zoom: 100,
  select: (activeTool) => set({ activeTool }),
  setZoom: (zoom) => set({ zoom: Math.min(400, Math.max(10, Math.round(zoom))) }),
}));

export const zoomIn = () => useToolStore.getState().setZoom(useToolStore.getState().zoom + ZOOM_STEP);
export const zoomOut = () =>
  useToolStore.getState().setZoom(useToolStore.getState().zoom - ZOOM_STEP);

/** Keys `1`–`6` and `V R D A T P` pick a tool. */
export function useToolShortcuts() {
  const select = useToolStore((state) => state.select);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.isContentEditable || /^(input|textarea|select)$/i.test(target?.tagName ?? "")) {
        return;
      }
      const byIndex = TOOLS[Number(event.key) - 1];
      const byLetter = TOOLS.find((tool) => tool.key === event.key.toLowerCase());
      const tool = byIndex ?? byLetter;
      if (tool) select(tool.id);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [select]);
}
