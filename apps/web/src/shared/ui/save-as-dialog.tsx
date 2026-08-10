import { Dialog } from "@base-ui/react/dialog";
import { cn } from "@excalidesk/ui/lib/utils";
import { Folder } from "lucide-react";
import { useEffect, useState } from "react";
import { create } from "zustand";

import { fs } from "@/shared/api/fs";
import { tildify } from "@/shared/lib";

export interface SaveAsResult {
  name: string;
  folder: string;
}

interface Request extends SaveAsResult {
  resolve: (result: SaveAsResult | null) => void;
}

/** Kept past `open` so the sheet animates out with its text intact. */
const useSaveAsStore = create<{ request: Request | null; open: boolean }>(() => ({
  request: null,
  open: false,
}));

/**
 * Electrobun 1.18 wraps `NSOpenPanel` only — there is no save panel to ask for
 * a destination, so the app supplies one. Same shape as `confirmAction`:
 * callers `await` a result, and `<SaveAsDialog />` is mounted once in the shell.
 */
export function saveAsAction(defaults: SaveAsResult): Promise<SaveAsResult | null> {
  return new Promise((resolve) => {
    useSaveAsStore.setState({ request: { ...defaults, resolve }, open: true });
  });
}

export function SaveAsDialog() {
  const request = useSaveAsStore((state) => state.request);
  const open = useSaveAsStore((state) => state.open);

  const [name, setName] = useState("");
  const [folder, setFolder] = useState("");

  // Each opening starts from the tab's own name and folder, not the last run's.
  useEffect(() => {
    if (!open || !request) return;
    setName(request.name);
    setFolder(request.folder);
  }, [open, request]);

  const settle = (result: SaveAsResult | null) => {
    request?.resolve(result);
    useSaveAsStore.setState({ open: false });
  };

  const trimmed = name.trim();

  const submit = () => {
    if (!trimmed) return;
    settle({ name: trimmed, folder });
  };

  const chooseFolder = async () => {
    const picked = await fs.pickDirectory();
    if (picked) setFolder(picked);
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) settle(null);
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop
          className={cn(
            "fixed inset-0 z-50 bg-black/25 backdrop-blur-[1px]",
            "transition-opacity duration-[140ms] data-closed:opacity-0 data-starting-style:opacity-0",
          )}
        />
        <Dialog.Popup
          className={cn(
            "fixed top-1/2 left-1/2 z-50 w-[360px] -translate-x-1/2 -translate-y-1/2",
            "rounded-[11px] border border-ed-menu-edge bg-ed-surface p-4",
            "shadow-[var(--ed-popover-shadow)] outline-none",
            "transition-[opacity,transform] duration-[140ms]",
            "data-closed:scale-95 data-closed:opacity-0",
            "data-starting-style:scale-95 data-starting-style:opacity-0",
          )}
        >
          <Dialog.Title className="text-[13px] font-semibold text-ed-ink-strong">
            Save As
          </Dialog.Title>

          <label className="mt-3 block text-[11px] font-medium text-ed-muted" htmlFor="save-as-name">
            Name
          </label>
          <input
            id="save-as-name"
            autoFocus
            value={name}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") submit();
            }}
            className={cn(
              "mt-1 w-full rounded-[6px] border border-ed-edge bg-ed-chrome px-2 py-1",
              "text-[12.5px] text-ed-ink outline-none focus:border-ed-accent",
            )}
          />

          <div className="mt-3 text-[11px] font-medium text-ed-muted">Where</div>
          <div className="mt-1 flex items-center gap-2">
            <Folder size={13} strokeWidth={1.5} className="flex-none text-ed-faint" />
            <span className="min-w-0 flex-1 truncate text-[12px] text-ed-ink" title={folder}>
              {tildify(folder)}
            </span>
            <button
              type="button"
              onClick={() => void chooseFolder()}
              className="flex-none rounded-[6px] border border-ed-edge px-2 py-0.5 text-[11.5px] text-ed-ink hover:bg-ed-hover"
            >
              Choose…
            </button>
          </div>

          <div className="mt-4 flex justify-end gap-2 text-[12.5px]">
            <button
              type="button"
              onClick={() => settle(null)}
              className="rounded-[6px] border border-ed-edge px-2.5 py-1 text-ed-ink hover:bg-ed-hover"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!trimmed}
              onClick={submit}
              className={cn(
                "rounded-[6px] bg-ed-accent px-2.5 py-1 font-medium text-white",
                "hover:opacity-90 disabled:opacity-40",
              )}
            >
              Save
            </button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
