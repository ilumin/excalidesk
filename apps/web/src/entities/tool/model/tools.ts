import {
  ArrowUpRight,
  Diamond,
  MousePointer2,
  Pencil,
  Square,
  Type,
  type LucideIcon,
} from "lucide-react";

export type ToolId = "select" | "rectangle" | "diamond" | "arrow" | "text" | "pen";

export interface Tool {
  id: ToolId;
  name: string;
  icon: LucideIcon;
  /** Single-key shortcut, alongside the positional keys 1–6. */
  key: string;
}

export const TOOLS: Tool[] = [
  { id: "select", name: "Select", icon: MousePointer2, key: "v" },
  { id: "rectangle", name: "Rectangle", icon: Square, key: "r" },
  { id: "diamond", name: "Diamond", icon: Diamond, key: "d" },
  { id: "arrow", name: "Arrow", icon: ArrowUpRight, key: "a" },
  { id: "text", name: "Text", icon: Type, key: "t" },
  { id: "pen", name: "Freehand", icon: Pencil, key: "p" },
];
