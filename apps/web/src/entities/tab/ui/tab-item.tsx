import { cn } from "@excalidesk/ui/lib/utils";
import { FileText, X } from "lucide-react";

import type { Tab } from "../model/tab-store";

interface TabItemProps {
  tab: Tab;
  active: boolean;
  onActivate: () => void;
  onClose: () => void;
}

export function TabItem({ tab, active, onActivate, onClose }: TabItemProps) {
  return (
    <div
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
        className="flex items-center gap-[7px] outline-none focus-visible:underline"
      >
        <FileText
          size={13}
          strokeWidth={1.4}
          className={active ? "text-ed-subtle" : "text-ed-faint"}
        />
        <span className={active ? "font-medium" : undefined}>{tab.title}</span>
      </button>

      {/* Dirty dot stands in for the close ✕ until the tab is hovered. */}
      {tab.isDirty ? (
        <span className="size-1.5 rounded-full bg-ed-dirty group-hover:hidden" />
      ) : null}
      <button
        type="button"
        aria-label={`Close ${tab.title}`}
        onClick={onClose}
        className={cn(
          "text-ed-subtle outline-none hover:text-ed-ink focus-visible:text-ed-ink",
          tab.isDirty ? "hidden group-hover:block" : active ? "block" : "hidden group-hover:block",
        )}
      >
        <X size={12} strokeWidth={1.6} />
      </button>
    </div>
  );
}
