import { Settings } from "lucide-react";

import { EditorMenuItems } from "@/features/editor-controls";
import { ThemeMenuItems } from "@/features/switch-theme";
import { IconButton, Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from "@/shared/ui";

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
      <MenuContent width={210} align="end" sideOffset={8} alignOffset={-2}>
        <ThemeMenuItems />
        {/* Carries its own leading separator — it renders nothing until an
            editor is mounted, and two rules in a row would look broken. */}
        <EditorMenuItems />
        <MenuSeparator />
        <MenuItem>Vault settings</MenuItem>
        <MenuItem shortcut="⌘,">Preferences</MenuItem>
      </MenuContent>
    </Menu>
  );
}
