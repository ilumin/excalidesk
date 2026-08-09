import { AlertDialog } from "@base-ui/react/alert-dialog";
import { cn } from "@excalidesk/ui/lib/utils";
import { create } from "zustand";

interface Request {
  message: string;
  detail?: string;
  confirmLabel: string;
  resolve: (confirmed: boolean) => void;
}

/**
 * `request` outlives `open` on purpose: clearing it on close would blank the
 * text mid-exit, and the popup would animate out with no content in it.
 */
const useConfirmStore = create<{ request: Request | null; open: boolean }>(() => ({
  request: null,
  open: false,
}));

/**
 * `window.confirm` names the page origin in its title, which reads as a web
 * page rather than an app — and electrobun 1.18.1 cannot stand in for it, its
 * `Utils.showMessageBox` never returns from the bun process. So the app owns
 * the sheet, and callers keep the same `if (await …)` shape.
 *
 * Requires `<ConfirmDialog />` mounted once, in the app shell.
 */
export function confirmAction(
  message: string,
  options: { detail?: string; confirmLabel?: string } = {},
): Promise<boolean> {
  return new Promise((resolve) => {
    useConfirmStore.setState({
      request: { message, confirmLabel: "OK", ...options, resolve },
      open: true,
    });
  });
}

export function ConfirmDialog() {
  const request = useConfirmStore((state) => state.request);
  const open = useConfirmStore((state) => state.open);

  const settle = (confirmed: boolean) => {
    request?.resolve(confirmed);
    useConfirmStore.setState({ open: false });
  };

  return (
    <AlertDialog.Root
      open={open}
      // Escape and backdrop clicks are a "no" — never a silent yes.
      onOpenChange={(open) => {
        if (!open) settle(false);
      }}
    >
      <AlertDialog.Portal>
        <AlertDialog.Backdrop
          className={cn(
            "fixed inset-0 z-50 bg-black/25 backdrop-blur-[1px]",
            "transition-opacity duration-[140ms] data-closed:opacity-0 data-starting-style:opacity-0",
          )}
        />
        <AlertDialog.Popup
          // An alert dialog deliberately ignores Escape and outside clicks, but
          // Escape-to-cancel is the platform convention and cancel is the safe
          // answer, so it is wired back up by hand.
          onKeyDown={(event) => {
            if (event.key === "Escape") settle(false);
          }}
          className={cn(
            "fixed top-1/2 left-1/2 z-50 w-[320px] -translate-x-1/2 -translate-y-1/2",
            "rounded-[11px] border border-ed-menu-edge bg-ed-surface p-4",
            "shadow-[var(--ed-popover-shadow)] outline-none",
            "transition-[opacity,transform] duration-[140ms]",
            "data-closed:scale-95 data-closed:opacity-0",
            "data-starting-style:scale-95 data-starting-style:opacity-0",
          )}
        >
          <AlertDialog.Title className="text-[13px] font-semibold text-ed-ink-strong">
            {request?.message}
          </AlertDialog.Title>
          {request?.detail ? (
            <AlertDialog.Description className="mt-1.5 text-[12px] text-ed-muted">
              {request.detail}
            </AlertDialog.Description>
          ) : null}

          <div className="mt-4 flex justify-end gap-2 text-[12.5px]">
            <button
              type="button"
              onClick={() => settle(false)}
              className="rounded-[6px] border border-ed-edge px-2.5 py-1 text-ed-ink hover:bg-ed-hover"
            >
              Cancel
            </button>
            <button
              type="button"
              autoFocus
              onClick={() => settle(true)}
              className="rounded-[6px] bg-ed-danger px-2.5 py-1 font-medium text-white hover:opacity-90"
            >
              {request?.confirmLabel}
            </button>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
