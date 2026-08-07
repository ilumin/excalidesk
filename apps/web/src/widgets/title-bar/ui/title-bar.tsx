import { cn } from "@excalidesk/ui/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { TabStrip } from "@/features/tab-management";
import { SidebarToggle, useSidebarStore } from "@/features/toggle-sidebar";
import { IconButton, TrafficLights } from "@/shared/ui";

import { SettingsMenu } from "./settings-menu";

interface TitleBarProps {
  /** `chrome` is the bare bar used by Welcome and Vault error. */
  variant?: "chrome" | "workspace";
}

export function TitleBar({ variant = "workspace" }: TitleBarProps) {
  const collapsed = useSidebarStore((state) => state.collapsed);
  const workspace = variant === "workspace";

  return (
    <div className="flex h-[46px] flex-none items-center bg-ed-chrome">
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
          <span className={cn(collapsed ? "ml-1" : "ml-auto")}>
            <SidebarToggle />
          </span>
        ) : null}
      </div>

      {workspace ? (
        <>
          <div className="flex items-center gap-0.5 px-1.5">
            <IconButton size={24} aria-label="Back">
              <ChevronLeft size={14} strokeWidth={1.6} />
            </IconButton>
            <IconButton size={24} aria-label="Forward">
              <ChevronRight size={14} strokeWidth={1.6} />
            </IconButton>
          </div>
          <TabStrip />
        </>
      ) : (
        <div className="flex-1" />
      )}

      <div className="flex items-center px-3">
        <SettingsMenu />
      </div>
    </div>
  );
}
