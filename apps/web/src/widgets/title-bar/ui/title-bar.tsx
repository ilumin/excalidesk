import { cn } from "@excalidesk/ui/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { FocusModeButton } from "@/features/focus-mode";
import { TabStrip } from "@/features/tab-management";
import { SidebarToggle, useSidebarStore } from "@/features/toggle-sidebar";
import { IconButton, TrafficLights } from "@/shared/ui";

import { SettingsMenu } from "./settings-menu";

interface TitleBarProps {
  /** `chrome` is the bare bar used by Welcome and Vault error. */
  variant?: "chrome" | "workspace";
}

// Electrobun's preload moves the window on mousedown inside `.drag`, unless the
// target sits under `.no-drag`. Inert class names in the browser build.
const DRAG = "electrobun-webkit-app-region-drag";
const NO_DRAG = "electrobun-webkit-app-region-no-drag";

export function TitleBar({ variant = "workspace" }: TitleBarProps) {
  const collapsed = useSidebarStore((state) => state.collapsed);
  const workspace = variant === "workspace";

  return (
    <div className={cn("flex h-[46px] flex-none items-center bg-ed-chrome", DRAG)}>
      <div
        className={cn(
          "flex items-center gap-2 pr-3 pl-4",
          // Expanded: the toggle sits at the right edge of the 260px sidebar column.
          workspace && !collapsed && "w-[260px] box-border",
        )}
      >
        <TrafficLights />
        <span className="ml-2.5 text-[12.5px] font-semibold tracking-[-0.01em] text-ed-ink-strong">
          Excalidesk
        </span>
        {workspace ? (
          <span className={cn(NO_DRAG, collapsed ? "ml-1" : "ml-auto")}>
            <SidebarToggle />
          </span>
        ) : null}
      </div>

      {workspace ? (
        <>
          <div className={cn("flex items-center gap-0.5 px-1.5", NO_DRAG)}>
            <IconButton size={24} aria-label="Back">
              <ChevronLeft size={14} strokeWidth={1.6} />
            </IconButton>
            <IconButton size={24} aria-label="Forward">
              <ChevronRight size={14} strokeWidth={1.6} />
            </IconButton>
          </div>
          <div className={cn("flex min-w-0 flex-1 items-center", NO_DRAG)}>
            <TabStrip />
          </div>
        </>
      ) : (
        <div className="flex-1" />
      )}

      <div className={cn("flex items-center gap-0.5 px-3", NO_DRAG)}>
        {workspace ? <FocusModeButton /> : null}
        <SettingsMenu />
      </div>
    </div>
  );
}
