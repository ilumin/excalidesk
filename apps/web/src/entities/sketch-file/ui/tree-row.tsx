import { cn } from "@excalidesk/ui/lib/utils";
import { ChevronRight, FileText, Folder } from "lucide-react";
import { useEffect, useRef, type DragEvent, type MouseEvent, type ReactNode } from "react";

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
  /** Turns the name into an input, in place — an inline rename or create. */
  editing?: {
    onCommit: (name: string) => void;
    onCancel: () => void;
  };
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

/**
 * Commits on Enter or blur, abandons on Escape — the behaviour of every file
 * explorer. Uncontrolled, so typing never re-renders the tree.
 */
function NameInput({
  defaultName,
  onCommit,
  onCancel,
}: { defaultName: string } & NonNullable<TreeRowProps["editing"]>) {
  // Escape fires before the blur it causes; without this the blur would commit.
  const abandoned = useRef(false);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const input = ref.current;
    if (!input) return;
    // A frame late, so it lands after the context menu's own focus handling —
    // otherwise that wipes the selection right after we set it.
    const frame = requestAnimationFrame(() => {
      input.focus();
      // Select the stem, so typing replaces the name but keeps `.excalidraw`.
      const dot = defaultName.lastIndexOf(".");
      input.setSelectionRange(0, dot > 0 ? dot : input.value.length);
    });
    return () => cancelAnimationFrame(frame);
  }, [defaultName]);

  return (
    <input
      ref={ref}
      defaultValue={defaultName}
      spellCheck={false}
      aria-label="Name"
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => {
        event.stopPropagation();
        if (event.key === "Enter") event.currentTarget.blur();
        if (event.key === "Escape") {
          abandoned.current = true;
          event.currentTarget.blur();
        }
      }}
      onBlur={(event) => {
        const name = event.target.value.trim();
        if (abandoned.current || !name || name === defaultName) onCancel();
        else onCommit(name);
      }}
      className={cn(
        "min-w-0 flex-1 rounded-[3px] bg-ed-surface px-1 py-px text-[12.5px] text-ed-ink-strong",
        "outline-2 -outline-offset-1 outline-ed-accent",
      )}
    />
  );
}

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
  editing,
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
      draggable={!editing}
      title={name}
      aria-selected={selected ?? active ?? false}
      aria-expanded={kind === "directory" ? expanded : undefined}
      onClick={editing ? undefined : onClick}
      onDoubleClick={editing ? undefined : onDoubleClick}
      onContextMenu={editing ? undefined : onContextMenu}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onKeyDown={(event) => {
        if (editing) return;
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
      {editing ? (
        <NameInput defaultName={name} {...editing} />
      ) : (
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
      )}
      {dirty && !editing ? (
        <span className="size-[5px] flex-none rounded-full bg-ed-dirty" />
      ) : null}
      {trailing && !editing ? <span className="flex-none">{trailing}</span> : null}
    </div>
  );
}
