import { FolderOpen, History, X } from "lucide-react";

import { useVaultStore } from "@/entities/vault";
import { parentPath, tildify } from "@/shared/lib";
import {
  MenuContent,
  MenuGroup,
  MenuItem,
  MenuLabel,
  MenuSeparator,
  MenuSub,
  MenuSubTrigger,
} from "@/shared/ui";

import { useOpenFolder } from "../model/use-open-folder";

/**
 * What "Vault settings" is actually for. Inline rather than a dialog — every
 * action here is a single command, and a window to hold three of them would be
 * more clicks, not fewer.
 */
export function VaultMenuItems() {
  const currentPath = useVaultStore((state) => state.path);
  const recentFolders = useVaultStore((state) => state.recentFolders);
  const { openFolder, openPath, close } = useOpenFolder();

  const others = recentFolders.filter(
    (folder) => folder.path !== currentPath && folder.missing !== true,
  );

  // Nothing to manage before a folder is open.
  if (!currentPath) return null;

  return (
    <MenuGroup>
      <MenuSeparator />
      <MenuLabel>Vault</MenuLabel>
      <MenuItem icon={FolderOpen} onClick={() => void openFolder()}>
        Open another folder…
      </MenuItem>
      {others.length > 0 ? (
        <MenuSub>
          <MenuSubTrigger icon={History}>Recent vaults</MenuSubTrigger>
          <MenuContent side="right" align="start" sideOffset={4}>
            {others.map((folder) => (
              <MenuItem
                key={folder.path}
                shortcut={tildify(parentPath(folder.path))}
                onClick={() => void openPath(folder.path)}
              >
                {folder.name}
              </MenuItem>
            ))}
          </MenuContent>
        </MenuSub>
      ) : null}
      <MenuItem icon={X} onClick={close}>
        Close vault
      </MenuItem>
    </MenuGroup>
  );
}
