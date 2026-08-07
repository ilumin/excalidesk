import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { MenuGroup, MenuItem, MenuLabel } from "@/shared/ui";

const OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "Match system", icon: Monitor },
] as const;

/**
 * The design calls for `data-theme` on `<html>`; this repo already runs
 * next-themes with `attribute="class"`, which is what Tailwind's `dark:` variant
 * and the token file key off. Persistence and "match system" come for free.
 */
export function ThemeMenuItems() {
  const { theme, setTheme } = useTheme();
  return (
    <MenuGroup>
      <MenuLabel>Appearance</MenuLabel>
      {OPTIONS.map((option) => (
        <MenuItem
          key={option.value}
          icon={option.icon}
          checked={theme === option.value}
          onClick={() => setTheme(option.value)}
        >
          {option.label}
        </MenuItem>
      ))}
    </MenuGroup>
  );
}
