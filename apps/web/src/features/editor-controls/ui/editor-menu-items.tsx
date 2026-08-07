import { ImageDown, LibraryBig, Minimize, Search, Trash2 } from "lucide-react";

import { useTabStore } from "@/entities/tab";
import { MenuGroup, MenuItem, MenuLabel, MenuSeparator } from "@/shared/ui";

import { useEditorStore } from "../model/editor-store";

/**
 * The Excalidraw actions worth keeping now that its ☰ menu is hidden. The rest
 * of that menu was file handling this app already owns.
 */
export function EditorMenuItems() {
  const ready = useEditorStore((state) => state.api !== null);
  const compact = useEditorStore((state) => state.compact);
  const store = useEditorStore();
  const title = useTabStore(
    (state) => state.tabs.find((tab) => tab.id === state.activeTabId)?.title ?? "sketch",
  );

  if (!ready) return null;

  return (
    <MenuGroup>
      <MenuSeparator />
      <MenuLabel>Canvas</MenuLabel>
      <MenuItem icon={Search} shortcut="⌘F" onClick={store.toggleSearch}>
        Find on canvas
      </MenuItem>
      <MenuItem icon={LibraryBig} onClick={store.toggleLibrary}>
        Library
      </MenuItem>
      <MenuItem icon={ImageDown} onClick={() => store.exportPng(title)}>
        Export as PNG
      </MenuItem>
      <MenuItem icon={Trash2} onClick={store.resetScene}>
        Clear canvas
      </MenuItem>
      <MenuItem icon={Minimize} checked={compact} onClick={store.toggleCompact}>
        Compact interface
      </MenuItem>
    </MenuGroup>
  );
}
