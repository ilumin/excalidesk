import { cn } from "@excalidesk/ui/lib/utils";
import type { ComponentProps } from "react";

interface IconButtonProps extends ComponentProps<"button"> {
  /** 24px for the nav chevrons, 26px for everything else in the title bar. */
  size?: 24 | 26;
  /** Renders the pressed/open look (`--bg-hover` fill). */
  active?: boolean;
}

export function IconButton({ size = 26, active, className, ...props }: IconButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "flex flex-none items-center justify-center rounded-[6px] transition-colors duration-[120ms]",
        "text-ed-faint hover:bg-ed-hover hover:text-ed-ink",
        "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ed-accent",
        size === 24 ? "size-6" : "size-[26px]",
        active && "bg-ed-hover text-ed-ink",
        className,
      )}
      {...props}
    />
  );
}
