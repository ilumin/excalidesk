import { cn } from "@excalidesk/ui/lib/utils";
import { ChevronRight, FileText, Folder } from "lucide-react";
import type { DragEvent, MouseEvent, ReactNode } from "react";

interface TreeRowProps {
  name: string;
  kind: "file" | "directory";
  depth: number;
  expanded?: boolean;
  /** The file currently on the canvas. */
  selected?: boolean;
  /** Active folder: `--bg-active` + inset ring. */
  active?: boolean;
  dirty?: boolean;
  /** A drag is hovering this folder. */
  dropTarget?: boolean;
  /** The trailing ⋯ button, rendered by the context-menu feature. */
  trailing?: ReactNode;
  onClick?: () => void;
  onDoubleClick?: () => void;
  onContextMenu?: (event: MouseEvent) => void;
  onDragStart?: (event: DragEvent) => void;
  onDragOver?: (event: DragEvent) => void;
  onDragLeave?: (event: DragEvent) => void;
  onDrop?: (event: DragEvent) => void;
}

/**
 * 16px per level. Files reserve the disclosure slot too, so their icons line up
 * with sibling folders instead of needing a per-kind nudge.
 */
const indentOf = (depth: number) => 8 + depth * 16;

export function TreeRow({
  name,
  kind,
  depth,
  expanded,
  selected,
  active,
  dirty,
  dropTarget,
  trailing,
  onClick,
  onDoubleClick,
  onContextMenu,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
}: TreeRowProps) {
  const Icon = kind === "directory" ? Folder : FileText;
  return (
    <div
      role="treeitem"
      tabIndex={0}
      draggable
      title={name}
      aria-selected={selected ?? active ?? false}
      aria-expanded={kind === "directory" ? expanded : undefined}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick?.();
        }
      }}
      style={{ paddingLeft: indentOf(depth), paddingRight: 8 }}
      className={cn(
        "flex h-[27px] cursor-default items-center gap-[7px] rounded-[6px] text-[12.5px]",
        "tracking-[-0.005em] transition-colors duration-[120ms] outline-none",
        "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ed-accent",
        selected
          ? "bg-ed-accent-bg"
          : active
            ? "bg-ed-active shadow-[inset_0_0_0_1px_var(--ed-active-ring)]"
            : "hover:bg-ed-hover",
        dropTarget && "shadow-[inset_0_0_0_1px_var(--ed-accent)]",
      )}
    >
      {/* Fixed slot so files and folders line their icons up at the same depth. */}
      <span className="flex size-[9px] flex-none items-center justify-center">
        {kind === "directory" ? (
          <ChevronRight
            size={9}
            strokeWidth={1.5}
            className={cn(
              "text-ed-subtle transition-transform duration-[120ms]",
              expanded && "rotate-90",
            )}
          />
        ) : null}
      </span>
      <Icon
        size={14}
        strokeWidth={1.35}
        className={cn("flex-none", selected ? "text-ed-accent" : "text-ed-subtle")}
      />
      <span
        className={cn(
          "min-w-0 flex-1 truncate",
          selected && "font-medium text-ed-accent-ink",
          active && "font-medium text-ed-ink-strong",
          !selected && !active && "text-ed-ink",
        )}
      >
        {name}
      </span>
      {dirty ? <span className="size-[5px] flex-none rounded-full bg-ed-dirty" /> : null}
      {trailing ? <span className="flex-none">{trailing}</span> : null}
    </div>
  );
}
