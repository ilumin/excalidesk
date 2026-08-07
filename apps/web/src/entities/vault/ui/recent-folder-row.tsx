import { cn } from "@excalidesk/ui/lib/utils";
import { Folder } from "lucide-react";

import { Mono } from "@/shared/ui";
import { parentPath, relativeTime, tildify } from "@/shared/lib";

import type { RecentFolder } from "../model/types";

interface RecentFolderRowProps {
  folder: RecentFolder;
  onOpen?: (path: string) => void;
}

export function RecentFolderRow({ folder, onOpen }: RecentFolderRowProps) {
  const missing = folder.missing === true;
  return (
    <button
      type="button"
      disabled={missing}
      onClick={() => onOpen?.(folder.path)}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-[7px] px-2.5 py-2 text-left transition-colors duration-[120ms]",
        missing ? "cursor-default opacity-55" : "hover:bg-ed-soft-hover",
      )}
    >
      <Folder size={15} strokeWidth={1.35} className="flex-none text-ed-subtle" />
      <span className="text-[12.5px] text-ed-ink">{folder.name}</span>
      <Mono className="text-[11px] text-ed-faint">{tildify(parentPath(folder.path))}</Mono>
      <span className={cn("ml-auto text-[11px]", missing ? "text-ed-danger" : "text-ed-faint")}>
        {missing ? "missing" : relativeTime(folder.lastOpenedAt)}
      </span>
    </button>
  );
}
