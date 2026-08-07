import { FilePlus, FolderPlus, MoreHorizontal, PencilLine, SquareArrowOutUpRight, Trash2 } from "lucide-react";
import type { ReactNode } from "react";

import {
  ContextMenu,
  ContextMenuTrigger,
  Menu,
  MenuContent,
  MenuItem,
  MenuSeparator,
  MenuTrigger,
} from "@/shared/ui";

import { useTreeActions } from "../model/use-tree-actions";

interface TreeNodeRef {
  path: string;
  kind: "file" | "directory";
}

function Items({ node }: { node: TreeNodeRef }) {
  const actions = useTreeActions();
  const parent = actions.parentFor(node.path, node.kind);
  return (
    <>
      <MenuItem icon={FilePlus} onClick={() => void actions.newFile(parent)}>
        New file
      </MenuItem>
      <MenuItem icon={FolderPlus} onClick={() => void actions.newFolder(parent)}>
        New folder
      </MenuItem>
      <MenuSeparator />
      <MenuItem icon={PencilLine} onClick={() => void actions.rename(node.path)}>
        Rename
      </MenuItem>
      <MenuItem icon={Trash2} onClick={() => void actions.remove(node.path)}>
        Delete
      </MenuItem>
      <MenuSeparator />
      <MenuItem icon={SquareArrowOutUpRight} onClick={() => void actions.reveal(node.path)}>
        Reveal in Finder
      </MenuItem>
    </>
  );
}

/** Right-click anywhere on the row. */
export function TreeItemContextMenu({
  node,
  children,
}: {
  node: TreeNodeRef;
  children: ReactNode;
}) {
  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <MenuContent align="start" side="right" sideOffset={2}>
        <Items node={node} />
      </MenuContent>
    </ContextMenu>
  );
}

/** The trailing ⋯ on the active folder — opens the same menu. */
export function TreeItemMenuButton({ node }: { node: TreeNodeRef }) {
  return (
    <Menu>
      <MenuTrigger
        aria-label="Row actions"
        className="flex items-center text-ed-subtle outline-none hover:text-ed-ink"
        onClick={(event) => event.stopPropagation()}
      >
        <MoreHorizontal size={14} />
      </MenuTrigger>
      <MenuContent align="start" side="bottom" sideOffset={4}>
        <Items node={node} />
      </MenuContent>
    </Menu>
  );
}
