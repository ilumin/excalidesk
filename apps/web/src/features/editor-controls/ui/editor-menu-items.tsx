import { LibraryBig, Minimize } from "lucide-react";

import { MenuGroup, MenuItem, MenuLabel, MenuSeparator } from "@/shared/ui";

import { useEditorStore } from "../model/editor-store";

/** The Excalidraw controls we took out of its own chrome. */
export function EditorMenuItems() {
  const ready = useEditorStore((state) => state.api !== null);
  const compact = useEditorStore((state) => state.compact);
  const toggleLibrary = useEditorStore((state) => state.toggleLibrary);
  const toggleCompact = useEditorStore((state) => state.toggleCompact);

  if (!ready) return null;

  return (
    <MenuGroup>
      <MenuSeparator />
      <MenuLabel>Canvas</MenuLabel>
      <MenuItem icon={LibraryBig} onClick={toggleLibrary}>
        Library
      </MenuItem>
      <MenuItem icon={Minimize} checked={compact} onClick={toggleCompact}>
        Compact interface
      </MenuItem>
    </MenuGroup>
  );
}
