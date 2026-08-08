import { Settings } from "lucide-react";

import { EditorMenuItems } from "@/features/editor-controls";
import { VaultMenuItems } from "@/features/open-folder";
import { ThemeMenuItems } from "@/features/switch-theme";
import { IconButton, Menu, MenuContent, MenuTrigger } from "@/shared/ui";

export function SettingsMenu() {
  return (
    <Menu>
      <MenuTrigger
        render={
          <IconButton aria-label="Settings">
            <Settings size={15} strokeWidth={1.4} />
          </IconButton>
        }
      />
      <MenuContent width={230} align="end" sideOffset={8} alignOffset={-2}>
        {/* Each group carries its own leading separator: both render nothing
            until there is a vault or a mounted editor, and a trailing rule
            with no group under it would look broken. */}
        <ThemeMenuItems />
        <EditorMenuItems />
        <VaultMenuItems />
      </MenuContent>
    </Menu>
  );
}
