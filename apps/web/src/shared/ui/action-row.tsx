import { cn } from "@excalidesk/ui/lib/utils";
import { ChevronRight, type LucideIcon } from "lucide-react";

interface ActionRowProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  /** The first action in a group: white surface, ring, accent icon. */
  primary?: boolean;
  onClick?: () => void;
}

export function ActionRow({ icon: Icon, title, subtitle, primary, onClick }: ActionRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-[9px] px-[14px] py-[13px] text-left transition-shadow duration-[120ms]",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ed-accent",
        primary
          ? "bg-ed-surface shadow-[0_0_0_1px_var(--ed-edge)] hover:shadow-[0_0_0_1px_var(--ed-edge-hover)]"
          : "hover:bg-ed-soft-hover",
      )}
    >
      <Icon
        size={19}
        strokeWidth={1.4}
        className={cn("flex-none", primary ? "text-ed-accent" : "text-ed-subtle")}
      />
      <span className="flex flex-col gap-0.5">
        <span className="text-[13px] font-semibold text-ed-ink">{title}</span>
        <span className="text-[12px] text-ed-subtle">{subtitle}</span>
      </span>
      <ChevronRight size={14} strokeWidth={1.6} className="ml-auto flex-none text-ed-chevron" />
    </button>
  );
}
