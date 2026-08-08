import type { DragEvent } from "react";

import { TreeRow, type SketchNode } from "@/entities/sketch-file";
import { useTabStore } from "@/entities/tab";
import { TreeItemContextMenu, TreeItemMenuButton } from "@/features/file-tree-context-menu";
import { parentPath } from "@/shared/lib";

import { useTreeStore } from "../model/tree-store";
import { useMoveEntry } from "../model/use-move-entry";

const MIME = "application/x-excalidesk-path";

interface FileTreeProps {
  nodes: SketchNode[];
  depth?: number;
}

export function FileTree({ nodes, depth = 0 }: FileTreeProps) {
  const expanded = useTreeStore((state) => state.expanded);
  const toggleFolder = useTreeStore((state) => state.toggleFolder);
  const activeFolderPath = useTreeStore((state) => state.activeFolderPath);
  const setActiveFolder = useTreeStore((state) => state.setActiveFolder);
  const dropTargetPath = useTreeStore((state) => state.dropTargetPath);
  const setDragging = useTreeStore((state) => state.setDragging);
  const setDropTarget = useTreeStore((state) => state.setDropTarget);
  const openTab = useTabStore((state) => state.open);
  const tabs = useTabStore((state) => state.tabs);
  const activeTabId = useTabStore((state) => state.activeTabId);
  const move = useMoveEntry();

  return (
    <>
      {nodes.map((node) => {
        const isDirectory = node.kind === "directory";
        const isOpen = expanded.includes(node.path);
        const isActiveFolder = isDirectory && node.path === activeFolderPath;
        const tab = tabs.find((candidate) => candidate.filePath === node.path);
        // Files drop into their parent folder, folders into themselves.
        const dropInto = isDirectory ? node.path : parentPath(node.path);

        const onDragOver = (event: DragEvent) => {
          if (!event.dataTransfer.types.includes(MIME)) return;
          event.preventDefault();
          // Without this the event reaches the tree container, whose own handler
          // would claim the drop for the vault root.
          event.stopPropagation();
          event.dataTransfer.dropEffect = "move";
          setDropTarget(dropInto);
        };

        return (
          <div key={node.path} className="flex flex-col gap-px">
            <TreeItemContextMenu node={{ path: node.path, kind: node.kind }}>
              <TreeRow
                name={node.name}
                kind={node.kind}
                depth={depth}
                expanded={isOpen}
                active={isActiveFolder}
                selected={!isDirectory && tab?.id === activeTabId}
                dirty={tab?.isDirty === true}
                dropTarget={isDirectory && dropTargetPath === node.path}
                trailing={
                  isActiveFolder ? (
                    <TreeItemMenuButton node={{ path: node.path, kind: node.kind }} />
                  ) : undefined
                }
                onClick={() => {
                  if (isDirectory) {
                    toggleFolder(node.path);
                  } else {
                    setActiveFolder(null);
                    openTab(node.path, "preview");
                  }
                }}
                onDoubleClick={() => {
                  if (!isDirectory) openTab(node.path, "permanent");
                }}
                // Mark the row so it's obvious what the menu will act on.
                onContextMenu={() => setActiveFolder(isDirectory ? node.path : null)}
                onDragStart={(event) => {
                  event.dataTransfer.setData(MIME, node.path);
                  event.dataTransfer.effectAllowed = "move";
                  setDragging(node.path);
                }}
                onDragOver={onDragOver}
                onDragLeave={() => setDropTarget(null)}
                onDrop={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  const source = event.dataTransfer.getData(MIME);
                  setDropTarget(null);
                  setDragging(null);
                  if (source) void move(source, dropInto);
                }}
              />
            </TreeItemContextMenu>
            {isDirectory && isOpen && node.children?.length ? (
              <FileTree nodes={node.children} depth={depth + 1} />
            ) : null}
          </div>
        );
      })}
    </>
  );
}

export { MIME as TREE_DRAG_MIME };
