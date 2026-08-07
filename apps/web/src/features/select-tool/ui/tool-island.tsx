import { cn } from "@excalidesk/ui/lib/utils";

import { TOOLS } from "@/entities/tool";

import { useToolStore } from "../model/tool-store";

export function ToolIsland() {
  const activeTool = useToolStore((state) => state.activeTool);
  const select = useToolStore((state) => state.select);

  return (
    <div
      role="toolbar"
      aria-label="Drawing tools"
      className={cn(
        "absolute top-4 left-1/2 z-3 flex -translate-x-1/2 items-center gap-0.5 p-[5px]",
        "rounded-[10px] border border-ed-edge-strong bg-ed-surface shadow-[var(--ed-island-shadow)]",
      )}
    >
      {TOOLS.map((tool) => {
        const active = tool.id === activeTool;
        return (
          <button
            key={tool.id}
            type="button"
            title={`${tool.name}  ${tool.key.toUpperCase()}`}
            aria-label={tool.name}
            aria-pressed={active}
            onClick={() => select(tool.id)}
            className={cn(
              "flex size-[30px] items-center justify-center rounded-[7px] transition-colors duration-[120ms]",
              active
                ? "bg-ed-accent-chip text-ed-accent-ink"
                : "text-ed-muted hover:bg-ed-hover",
            )}
          >
            <tool.icon size={18} strokeWidth={1.45} />
          </button>
        );
      })}
    </div>
  );
}
