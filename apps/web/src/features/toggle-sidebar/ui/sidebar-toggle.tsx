import { PanelLeft } from "lucide-react";

import { IconButton } from "@/shared/ui";

import { useSidebarStore } from "../model/sidebar-store";

export function SidebarToggle() {
  const collapsed = useSidebarStore((state) => state.collapsed);
  const toggle = useSidebarStore((state) => state.toggle);
  return (
    <IconButton
      onClick={toggle}
      active={collapsed}
      aria-label={collapsed ? "Show sidebar" : "Hide sidebar"}
      title={`${collapsed ? "Show" : "Hide"} sidebar  ⌘\\`}
    >
      <PanelLeft size={15} strokeWidth={1.4} />
    </IconButton>
  );
}
