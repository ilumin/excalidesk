import { cn } from "@excalidesk/ui/lib/utils";
import type { ComponentProps } from "react";

/** Filesystem paths and `.excalidraw` mentions render in the mono stack. */
export function Mono({ className, ...props }: ComponentProps<"span">) {
  return <span className={cn("font-mono-path", className)} {...props} />;
}
