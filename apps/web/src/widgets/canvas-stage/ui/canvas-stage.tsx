import type { ReactNode } from "react";

import { ToolIsland, ZoomControl } from "@/features/select-tool";
import { CanvasPanel } from "@/shared/ui";

import { SketchPlaceholder } from "./sketch-placeholder";

interface CanvasStageProps {
  /**
   * MOUNT SEAM — the real Excalidraw canvas goes here:
   *
   *   <CanvasStage>
   *     <Excalidraw theme={theme} initialData={…} onChange={markDirty} />
   *   </CanvasStage>
   *
   * It renders above the dotted background and below the floating controls, so
   * the tool island and zoom pill stay owned by this shell. Nothing else about
   * the widget changes when the engine lands; drop `SketchPlaceholder` then.
   */
  children?: ReactNode;
}

export function CanvasStage({ children }: CanvasStageProps) {
  return (
    <CanvasPanel>
      <div className="relative flex-1 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(var(--ed-dots) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />
        {children ?? <SketchPlaceholder />}
        <ToolIsland />
        <ZoomControl />
      </div>
    </CanvasPanel>
  );
}
