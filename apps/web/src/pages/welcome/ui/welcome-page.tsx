import { FilePlus2, FolderOpen, FolderPlus, Info } from "lucide-react";

import { FolderDropZone, useOpenFolder } from "@/features/open-folder";
import { ActionRow, CanvasPanel, Mono } from "@/shared/ui";
import { TitleBar } from "@/widgets/title-bar";

export function WelcomePage() {
  const { openFolder, createNewFolder, openSingleFile } = useOpenFolder();

  return (
    <div className="ed-app flex h-full flex-col bg-ed-chrome">
      <TitleBar variant="chrome" />
      <FolderDropZone>
        <CanvasPanel className="items-center justify-center">
          <div className="flex w-[520px] flex-col gap-[26px]">
            <div className="flex flex-col gap-[9px]">
              <span className="font-hand text-[44px] leading-none text-ed-sketch">Excalidesk</span>
              <p className="max-w-[44ch] text-[13.5px] leading-[1.6] text-ed-muted text-pretty">
                Your sketches live as plain{" "}
                <Mono className="text-[12.5px] text-ed-ink">.excalidraw</Mono> files in a folder on
                this Mac. Pick that folder to get started — nothing is uploaded anywhere.
              </p>
            </div>

            <div className="flex flex-col gap-px">
              <ActionRow
                primary
                icon={FolderOpen}
                title="Open folder"
                subtitle="Use an existing folder of sketches"
                onClick={() => void openFolder()}
              />
              <ActionRow
                icon={FolderPlus}
                title="Create new folder"
                subtitle="Start a fresh sketch folder"
                onClick={() => void createNewFolder()}
              />
              <ActionRow
                icon={FilePlus2}
                title="Open single file"
                subtitle="Edit one .excalidraw file without a folder"
                onClick={() => void openSingleFile()}
              />
            </div>

            <div className="flex items-center gap-[9px] pt-0.5 text-[12px] text-ed-faint">
              <Info size={13} strokeWidth={1.4} />
              <span>You can drag a folder onto this window instead.</span>
            </div>
          </div>
        </CanvasPanel>
      </FolderDropZone>
    </div>
  );
}
