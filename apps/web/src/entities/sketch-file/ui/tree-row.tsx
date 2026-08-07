import { cn } from "@excalidesk/ui/lib/utils";
import { ChevronRight, FileText, Folder } from "lucide-react";
import type { MouseEvent, ReactNode } from "react";

interface TreeRowProps {
  name: string;
  kind: "file" | "directory";
  depth: number;
  expanded?: boolean;
  /** Selected file: accent row + accent label. */
  selected?: boolean;
  /** Active folder: `--bg-active` + inset ring. */
  active?: boolean;
  dirty?: boolean;
  /** The trailing ⋯ button, rendered by the context-menu feature. */
  trailing?: ReactNode;
  onClick?: () => void;
  onDoubleClick?: () => void;
  onContextMenu?: (event: MouseEvent) => void;
}

/**
 * Indent: 16px per level, plus 5px for files so their icon clears the parent's
 * disclosure chevron (8 / 24 / 45 for the levels in the design reference).
 */
const indentOf = (depth: number, kind: TreeRowProps["kind"]) =>
  8 + depth * 16 + (kind === "file" && depth > 0 ? 5 : 0);

export function TreeRow({
  name,
  kind,
  depth,
  expanded,
  selected,
  active,
  dirty,
  trailing,
  onClick,
  onDoubleClick,
  onContextMenu,
}: TreeRowProps) {
  const Icon = kind === "directory" ? Folder : FileText;
  return (
    <div
      role="treeitem"
      tabIndex={0}
      aria-selected={selected ?? active ?? false}
      aria-expanded={kind === "directory" ? expanded : undefined}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick?.();
        }
      }}
      style={{ paddingLeft: indentOf(depth, kind), paddingRight: 8 }}
      className={cn(
        "flex h-[27px] cursor-default items-center gap-[7px] rounded-[6px] text-[12.5px]",
        "tracking-[-0.005em] transition-colors duration-[120ms] outline-none",
        "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ed-accent",
        selected
          ? "bg-ed-accent-bg"
          : active
            ? "bg-ed-active shadow-[inset_0_0_0_1px_var(--ed-active-ring)]"
            : "hover:bg-ed-hover",
      )}
    >
      {kind === "directory" ? (
        <ChevronRight
          size={9}
          strokeWidth={1.5}
          className={cn(
            "flex-none text-ed-subtle transition-transform duration-[120ms]",
            expanded && "rotate-90",
          )}
        />
      ) : null}
      <Icon
        size={kind === "directory" ? 15 : 14}
        strokeWidth={1.35}
        className={cn("flex-none", selected ? "text-ed-accent" : "text-ed-subtle")}
      />
      <span
        className={cn(
          "truncate",
          selected && "font-medium text-ed-accent-ink",
          active && "font-medium text-ed-ink-strong",
          !selected && !active && "text-ed-ink",
        )}
      >
        {name}
      </span>
      {dirty ? (
        <span className="ml-auto size-[5px] flex-none rounded-full bg-ed-dirty" />
      ) : null}
      {trailing ? <span className={cn(dirty ? "ml-1" : "ml-auto")}>{trailing}</span> : null}
    </div>
  );
}
