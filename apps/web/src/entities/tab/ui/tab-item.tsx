import { cn } from "@excalidesk/ui/lib/utils";
import { FileText, X } from "lucide-react";

import type { Tab } from "../model/tab-store";

interface TabItemProps {
  tab: Tab;
  active: boolean;
  onActivate: () => void;
  onKeep: () => void;
  onClose: () => void;
}

export function TabItem({ tab, active, onActivate, onKeep, onClose }: TabItemProps) {
  return (
    <div
      title={tab.filePath}
      onDoubleClick={onKeep}
      className={cn(
        "group flex h-7 flex-none cursor-default items-center gap-[7px] rounded-[7px] px-[9px]",
        "text-[12.5px] transition-colors duration-[120ms]",
        active
          ? "bg-ed-surface font-medium text-ed-ink-strong shadow-[var(--ed-tab-shadow)]"
          : "text-ed-muted hover:bg-ed-hover hover:text-ed-ink",
      )}
    >
      <button
        type="button"
        onClick={onActivate}
        className="flex min-w-0 items-center gap-[7px] outline-none focus-visible:underline"
      >
        <FileText
          size={14}
          strokeWidth={1.4}
          className={cn("flex-none", active ? "text-ed-subtle" : "text-ed-faint")}
        />
        <span
          className={cn(
            "max-w-[140px] truncate",
            active && "font-medium",
            // Preview tabs read as provisional, the way VS Code marks them.
            tab.preview && "italic",
          )}
        >
          {tab.title}
        </span>
      </button>

      {/*
        Fixed-width slot. The dot and the ✕ swap by opacity, never by presence,
        so hovering a tab can't shift the strip.
      */}
      <span className="relative flex size-3 flex-none items-center justify-center">
        {tab.isDirty ? (
          <span className="absolute size-1.5 rounded-full bg-ed-dirty group-hover:opacity-0" />
        ) : null}
        <button
          type="button"
          aria-label={`Close ${tab.title}`}
          onClick={onClose}
          className={cn(
            "absolute flex text-ed-subtle opacity-0 transition-opacity duration-[120ms]",
            "hover:text-ed-ink group-hover:opacity-100 focus-visible:opacity-100",
            active && !tab.isDirty && "opacity-100",
          )}
        >
          <X size={12} strokeWidth={1.6} />
        </button>
      </span>
    </div>
  );
}
