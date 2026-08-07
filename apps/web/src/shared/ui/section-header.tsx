import { cn } from "@excalidesk/ui/lib/utils";
import type { ComponentProps } from "react";

/** The 10px uppercase label used for `~/Sketches`, `RECENT`, `APPEARANCE`. */
export function SectionHeader({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "text-[10px] font-semibold uppercase tracking-[0.09em] text-ed-faint",
        className,
      )}
      {...props}
    />
  );
}
