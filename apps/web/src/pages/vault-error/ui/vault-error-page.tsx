import { FolderOpen, Search, TriangleAlert } from "lucide-react";

import { RecentFolderRow, useVaultStore } from "@/entities/vault";
import { useOpenFolder } from "@/features/open-folder";
import { tildify } from "@/shared/lib";
import { ActionRow, CanvasPanel, Mono, SectionHeader } from "@/shared/ui";
import { TitleBar } from "@/widgets/title-bar";

export function VaultErrorPage() {
  const missingPath = useVaultStore((state) => state.path) ?? "";
  const missingName = useVaultStore((state) => state.name);
  const recentFolders = useVaultStore((state) => state.recentFolders);
  const { openFolder, openPath } = useOpenFolder();

  return (
    <div className="ed-app flex h-full flex-col bg-ed-chrome">
      <TitleBar variant="chrome" />
      <CanvasPanel className="items-center justify-center">
        <div className="flex w-[520px] flex-col gap-6">
          <div className="flex gap-3 rounded-[9px] bg-ed-danger-bg px-[15px] py-[14px] shadow-[0_0_0_1px_var(--ed-danger-edge)]">
            <TriangleAlert
              size={18}
              strokeWidth={1.5}
              className="mt-px flex-none text-ed-danger"
            />
            <div className="flex flex-col gap-[5px]">
              <span className="text-[13px] font-semibold text-ed-danger-ink">
                Can't open your last folder
              </span>
              <p className="text-[12.5px] leading-[1.6] text-ed-danger-body text-pretty">
                <Mono className="text-[12px]">{tildify(missingPath)}</Mono> no longer exists. It may
                have been moved, renamed, or deleted outside Excalidesk. Your files are untouched if
                the folder was only moved — point Excalidesk at its new location.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-px">
            <ActionRow
              primary
              icon={Search}
              title="Locate folder"
              subtitle={`Find where "${missingName}" moved to`}
              onClick={() => void openFolder()}
            />
            <ActionRow
              icon={FolderOpen}
              title="Open another folder"
              subtitle="Choose a different folder of sketches"
              onClick={() => void openFolder()}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <SectionHeader>Recent</SectionHeader>
            {recentFolders.map((folder) => (
              <RecentFolderRow
                key={folder.path}
                folder={folder}
                onOpen={(path) => void openPath(path)}
              />
            ))}
          </div>
        </div>
      </CanvasPanel>
    </div>
  );
}
