import { Check, FilePlus, FolderPlus } from "lucide-react";

import { useVaultStore } from "@/entities/vault";
import { useTreeActions } from "@/features/file-tree-context-menu";
import { relativeTime, tildify } from "@/shared/lib";
import { SectionHeader } from "@/shared/ui";

import { FileTree } from "./file-tree";

export function FileTreeSidebar() {
  const path = useVaultStore((state) => state.path);
  const tree = useVaultStore((state) => state.tree);
  const actions = useTreeActions();
  const root = path ?? "";
  const label = tildify(root);

  return (
    <div className="flex h-full w-[260px] flex-none flex-col overflow-hidden bg-ed-chrome">
      <div className="flex items-center justify-between px-4 pt-2.5 pb-2">
        <SectionHeader className="truncate">{label}</SectionHeader>
        <div className="flex gap-0.5 text-ed-faint">
          <button
            type="button"
            aria-label="New folder"
            onClick={() => void actions.newFolder(root)}
            className="hover:text-ed-ink"
          >
            <FolderPlus size={14} strokeWidth={1.4} />
          </button>
          <button
            type="button"
            aria-label="New file"
            onClick={() => void actions.newFile(root)}
            className="hover:text-ed-ink"
          >
            <FilePlus size={14} strokeWidth={1.4} />
          </button>
        </div>
      </div>

      <div role="tree" className="flex flex-col gap-px overflow-y-auto px-2 text-ed-ink">
        <FileTree nodes={tree} />
      </div>

      <div className="mt-auto flex items-center gap-[7px] border-t border-ed-hover px-4 py-2.5 text-[11px] text-ed-faint">
        <Check size={12} strokeWidth={1.5} />
        <span className="truncate">
          Saved to {label} · {relativeTime(Date.now() - 120_000)}
        </span>
      </div>
    </div>
  );
}
