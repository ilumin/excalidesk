import { Save, X, XSquare } from "lucide-react";
import type { ReactNode } from "react";

import { type Tab, useTabStore } from "@/entities/tab";
import { ContextMenu, ContextMenuTrigger, MenuContent, MenuItem, MenuSeparator } from "@/shared/ui";

import { useTabActions } from "../model/use-tab-actions";

/** Right-click anywhere on the tab. */
export function TabContextMenu({ tab, children }: { tab: Tab; children: ReactNode }) {
  const actions = useTabActions();
  const alone = useTabStore((state) => state.tabs.length === 1);
  const active = useTabStore((state) => state.activeTabId === tab.id);

  // A tab that is neither on screen nor on disk has no scene to copy anywhere.
  const canSaveAs = active || tab.isNew !== true;

  return (
    <ContextMenu>
      {/* The trigger becomes the flex item in the strip, so it carries the
          tab's own `flex-none` — otherwise tabs shrink as the strip fills. */}
      <ContextMenuTrigger className="flex-none">{children}</ContextMenuTrigger>
      <MenuContent align="start" side="bottom" sideOffset={4}>
        <MenuItem icon={X} shortcut="⌘W" onClick={() => void actions.closeTabs([tab.id])}>
          Close
        </MenuItem>
        {alone ? null : (
          <MenuItem icon={XSquare} onClick={() => void actions.closeOthers(tab.id)}>
            Close Others
          </MenuItem>
        )}
        <MenuItem icon={XSquare} onClick={() => void actions.closeAll()}>
          Close All
        </MenuItem>
        {canSaveAs ? (
          <>
            <MenuSeparator />
            <MenuItem icon={Save} onClick={() => void actions.saveAs(tab.id)}>
              Save As…
            </MenuItem>
          </>
        ) : null}
      </MenuContent>
    </ContextMenu>
  );
}
