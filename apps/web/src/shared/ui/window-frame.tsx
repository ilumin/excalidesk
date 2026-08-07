import type { ReactNode } from "react";

/**
 * The 1180×686 macOS window from the design reference. The shipped app fills the
 * real window instead — this exists so Storybook can show each screen at the
 * exact size the handoff specifies.
 */
export function WindowFrame({ children }: { children: ReactNode }) {
  return (
    <div className="ed-app h-[686px] w-[1180px] overflow-hidden rounded-[11px] border border-ed-window-edge bg-ed-chrome shadow-[var(--ed-window-shadow)]">
      {children}
    </div>
  );
}
