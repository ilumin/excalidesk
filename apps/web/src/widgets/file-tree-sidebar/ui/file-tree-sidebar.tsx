import { cn } from "@excalidesk/ui/lib/utils";
import { Check, FilePlus, FolderPlus } from "lucide-react";
import { useEffect, type DragEvent } from "react";

import { useVaultStore } from "@/entities/vault";
import { useDraftStore, useTreeActions } from "@/features/file-tree-context-menu";
import { basename, relativeTime, tildify } from "@/shared/lib";
import { SectionHeader } from "@/shared/ui";

import { useTreeStore } from "../model/tree-store";
import { useMoveEntry } from "../model/use-move-entry";
import { FileTree, TREE_DRAG_MIME } from "./file-tree";

export function FileTreeSidebar() {
  const path = useVaultStore((state) => state.path);
  const tree = useVaultStore((state) => state.tree);
  const dropTargetPath = useTreeStore((state) => state.dropTargetPath);
  const setDropTarget = useTreeStore((state) => state.setDropTarget);
  const setDragging = useTreeStore((state) => state.setDragging);
  const actions = useTreeActions();
  const move = useMoveEntry();
  const draft = useDraftStore((state) => state.draft);
  const expandFolder = useTreeStore((state) => state.expandFolder);
  const root = path ?? "";
  const fullPath = tildify(root);

  // Creating inside a collapsed folder would put the input out of sight.
  useEffect(() => {
    if (draft?.mode === "create") expandFolder(draft.parentPath);
  }, [draft, expandFolder]);

  // Dropping on empty space below the tree moves the entry to the vault root.
  const onDragOver = (event: DragEvent) => {
    if (!event.dataTransfer.types.includes(TREE_DRAG_MIME)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setDropTarget(root);
  };

  return (
    <div className="flex h-full w-[260px] flex-none flex-col overflow-hidden bg-ed-chrome">
      <div className="flex items-center gap-2 px-4 pt-2.5 pb-2">
        {/* Just the folder name; the full path lives in the tooltip. */}
        <SectionHeader className="min-w-0 flex-1 truncate" title={fullPath}>
          {basename(root)}
        </SectionHeader>
        <div className="flex flex-none gap-1 text-ed-faint">
          <button
            type="button"
            aria-label="New folder"
            title="New folder"
            onClick={() => void actions.newFolder(root)}
            className="hover:text-ed-ink"
          >
            <FolderPlus size={14} strokeWidth={1.4} />
          </button>
          <button
            type="button"
            aria-label="New file"
            title="New file"
            onClick={() => void actions.newFile(root)}
            className="hover:text-ed-ink"
          >
            <FilePlus size={14} strokeWidth={1.4} />
          </button>
        </div>
      </div>

      <div
        role="tree"
        onDragOver={onDragOver}
        onDragLeave={() => setDropTarget(null)}
        onDrop={(event) => {
          event.preventDefault();
          const source = event.dataTransfer.getData(TREE_DRAG_MIME);
          setDropTarget(null);
          setDragging(null);
          if (source) void move(source, root);
        }}
        className={cn(
          "flex flex-1 flex-col gap-px overflow-y-auto px-2 text-ed-ink",
          dropTargetPath === root && "bg-ed-accent-bg/40",
        )}
      >
        <FileTree nodes={tree} parentPath={root} />
      </div>

      <div className="flex flex-none items-center gap-[7px] border-t border-ed-hover px-4 py-2.5 text-[11px] text-ed-faint">
        <Check size={12} strokeWidth={1.5} className="flex-none" />
        <span className="truncate" title={fullPath}>
          Saved to {fullPath} · {relativeTime(Date.now() - 120_000)}
        </span>
      </div>
    </div>
  );
}
