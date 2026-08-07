import { cn } from "@excalidesk/ui/lib/utils";
import type { ComponentProps } from "react";

/** The raised right-hand panel: 1px top/left border and an 11px top-left radius. */
export function CanvasPanel({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 flex-col overflow-hidden rounded-tl-[11px]",
        "border-t border-l border-ed-edge bg-ed-canvas",
        className,
      )}
      {...props}
    />
  );
}
