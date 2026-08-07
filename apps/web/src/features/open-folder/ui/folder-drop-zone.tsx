import { useState, type DragEvent, type ReactNode } from "react";

import { useOpenFolder } from "../model/use-open-folder";

/**
 * Dropping a folder onto the window opens it. Browsers only hand back a file
 * name, so the drop falls through to the same picker the buttons use — the
 * desktop shell will supply the real path via the same `openPath` call.
 */
export function FolderDropZone({ children }: { children: ReactNode }) {
  const [over, setOver] = useState(false);
  const { openFolder } = useOpenFolder();

  const stop = (event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div
      className="relative flex min-h-0 flex-1"
      onDragOver={(event) => {
        stop(event);
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(event) => {
        stop(event);
        setOver(false);
        void openFolder();
      }}
    >
      {children}
      {over ? (
        <div className="pointer-events-none absolute inset-3 rounded-[10px] border-2 border-dashed border-ed-accent bg-ed-accent-bg/40" />
      ) : null}
    </div>
  );
}
