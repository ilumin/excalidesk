import { ContextMenu as ContextMenuPrimitive } from "@base-ui/react/context-menu";
import { Menu as MenuPrimitive } from "@base-ui/react/menu";
import { cn } from "@excalidesk/ui/lib/utils";
import type { LucideIcon } from "lucide-react";
import { Check, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

/**
 * The app's own popover kit — the shared shadcn `DropdownMenu` carries its own
 * surface styling, and these menus are token-matched to the Excalidesk chrome.
 * Focus, escape, and outside-click behaviour still come from Base UI.
 */
export const Menu = MenuPrimitive.Root;
export const MenuTrigger = MenuPrimitive.Trigger;
export const ContextMenu = ContextMenuPrimitive.Root;
export const ContextMenuTrigger = ContextMenuPrimitive.Trigger;

interface MenuContentProps {
  children: ReactNode;
  /** 210px for the settings menu; context menus size to content. */
  width?: number;
  align?: "start" | "center" | "end";
  side?: "top" | "bottom" | "left" | "right";
  sideOffset?: number;
  alignOffset?: number;
}

export function MenuContent({
  children,
  width,
  align = "end",
  side = "bottom",
  sideOffset = 8,
  alignOffset = 0,
}: MenuContentProps) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner
        className="z-50 outline-none"
        align={align}
        side={side}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
      >
        <MenuPrimitive.Popup
          style={width ? { width } : undefined}
          className={cn(
            "min-w-[180px] rounded-[9px] border border-ed-menu-edge bg-ed-surface p-[5px]",
            "shadow-[var(--ed-popover-shadow)] outline-none",
            "origin-[var(--transform-origin)] transition-[opacity,transform] duration-[140ms]",
            "data-closed:translate-y-2 data-closed:opacity-0 data-starting-style:translate-y-2 data-starting-style:opacity-0",
          )}
        >
          {children}
        </MenuPrimitive.Popup>
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  );
}

/** A `MenuLabel` must live inside a group together with the items it names. */
export const MenuGroup = MenuPrimitive.Group;

export function MenuLabel({ children }: { children: ReactNode }) {
  return (
    <MenuPrimitive.GroupLabel className="block px-[9px] pt-[7px] pb-[5px] text-[10px] font-semibold uppercase tracking-[0.09em] text-ed-faint">
      {children}
    </MenuPrimitive.GroupLabel>
  );
}

interface MenuItemProps {
  children: ReactNode;
  icon?: LucideIcon;
  /** Right-aligned hint, e.g. `⌘,`. */
  shortcut?: string;
  checked?: boolean;
  onClick?: () => void;
}

export function MenuItem({ children, icon: Icon, shortcut, checked, onClick }: MenuItemProps) {
  return (
    <MenuPrimitive.Item
      onClick={onClick}
      className={cn(
        "flex h-[29px] cursor-default select-none items-center gap-[9px] rounded-[6px] px-[9px]",
        "text-[12.5px] text-ed-ink outline-none data-highlighted:bg-ed-soft-hover",
        checked && "bg-ed-soft-hover",
      )}
    >
      {Icon ? (
        <Icon
          size={14}
          strokeWidth={1.4}
          className={checked ? "text-ed-accent" : "text-ed-subtle"}
        />
      ) : null}
      <span>{children}</span>
      {checked ? (
        <Check size={13} strokeWidth={1.7} className="ml-auto text-ed-accent" />
      ) : shortcut ? (
        <span className="ml-auto text-[11px] text-ed-faint">{shortcut}</span>
      ) : null}
    </MenuPrimitive.Item>
  );
}

/** Submenus reuse `MenuContent` for their popup — pass `side="right"`. */
export const MenuSub = MenuPrimitive.SubmenuRoot;

export function MenuSubTrigger({ children, icon: Icon }: { children: ReactNode; icon?: LucideIcon }) {
  return (
    <MenuPrimitive.SubmenuTrigger
      className={cn(
        "flex h-[29px] cursor-default select-none items-center gap-[9px] rounded-[6px] px-[9px]",
        "text-[12.5px] text-ed-ink outline-none",
        "data-highlighted:bg-ed-soft-hover data-popup-open:bg-ed-soft-hover",
      )}
    >
      {Icon ? <Icon size={14} strokeWidth={1.4} className="text-ed-subtle" /> : null}
      <span>{children}</span>
      <ChevronRight size={13} strokeWidth={1.6} className="ml-auto text-ed-faint" />
    </MenuPrimitive.SubmenuTrigger>
  );
}

export function MenuSeparator() {
  return <MenuPrimitive.Separator className="mx-1 my-[5px] h-px bg-ed-hover" />;
}
