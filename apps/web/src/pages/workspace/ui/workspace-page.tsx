import { useEffect } from "react";

import { useVaultStore } from "@/entities/vault";
import { ExitFocusButton, useFocusExitShortcut, useFocusStore } from "@/features/focus-mode";
import { useSidebarShortcut, useSidebarStore } from "@/features/toggle-sidebar";
import { CanvasStage } from "@/widgets/canvas-stage";
import { FileTreeSidebar } from "@/widgets/file-tree-sidebar";
import { TitleBar } from "@/widgets/title-bar";

export function WorkspacePage() {
  const collapsed = useSidebarStore((state) => state.collapsed);
  const focused = useFocusStore((state) => state.focused);
  const refresh = useVaultStore((state) => state.refresh);
  useSidebarShortcut();
  useFocusExitShortcut();

  // A folder can move or vanish while the app is in the background.
  useEffect(() => {
    const onFocus = () => void refresh();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refresh]);

  return (
    <div className="ed-app flex h-full flex-col bg-ed-chrome">
      {focused ? null : <TitleBar />}
      {/* CanvasStage keeps its position in the tree across both modes so the
          editor is never remounted — scroll, zoom, and undo history survive. */}
      <div className="relative flex min-h-0 flex-1">
        <div
          className="flex-none overflow-hidden transition-[width] duration-200 ease-out"
          style={{ width: focused || collapsed ? 0 : 260 }}
        >
          <FileTreeSidebar />
        </div>
        <CanvasStage flush={focused} />
        {focused ? <ExitFocusButton /> : null}
      </div>
    </div>
  );
}
