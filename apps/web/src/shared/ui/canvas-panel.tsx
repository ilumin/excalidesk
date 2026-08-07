import { cn } from "@excalidesk/ui/lib/utils";
import type { ComponentProps } from "react";

/**
 * The document surface. It floats on the chrome with an inset on all four sides
 * so the panel reads as a card resting on the window rather than a region
 * butted against it.
 */
export function CanvasPanel({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 flex-col overflow-hidden",
        "m-2 rounded-[11px] border border-ed-edge bg-ed-canvas shadow-[var(--ed-panel-shadow)]",
        className,
      )}
      {...props}
    />
  );
}
