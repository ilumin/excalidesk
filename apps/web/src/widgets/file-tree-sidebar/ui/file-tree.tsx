import { TreeItemContextMenu, TreeItemMenuButton } from "@/features/file-tree-context-menu";
import { TreeRow, type SketchNode } from "@/entities/sketch-file";
import { useTabStore } from "@/entities/tab";

import { useTreeStore } from "../model/tree-store";

interface FileTreeProps {
  nodes: SketchNode[];
  depth?: number;
}

export function FileTree({ nodes, depth = 0 }: FileTreeProps) {
  const expanded = useTreeStore((state) => state.expanded);
  const toggleFolder = useTreeStore((state) => state.toggleFolder);
  const activeFolderPath = useTreeStore((state) => state.activeFolderPath);
  const setActiveFolder = useTreeStore((state) => state.setActiveFolder);
  const openTab = useTabStore((state) => state.open);
  const tabs = useTabStore((state) => state.tabs);
  const activeTabId = useTabStore((state) => state.activeTabId);

  return (
    <>
      {nodes.map((node) => {
        const isDirectory = node.kind === "directory";
        const isOpen = expanded.includes(node.path);
        const isActiveFolder = isDirectory && node.path === activeFolderPath;
        const tab = tabs.find((candidate) => candidate.filePath === node.path);

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
                    openTab(node.path);
                  }
                }}
                onDoubleClick={() => {
                  if (!isDirectory) openTab(node.path, true);
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
