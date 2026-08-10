import { useEffect } from "react";

import { useVaultStore } from "@/entities/vault";
import { VaultErrorPage } from "@/pages/vault-error";
import { WelcomePage } from "@/pages/welcome";
import { WorkspacePage } from "@/pages/workspace";
import { ConfirmDialog } from "@/shared/ui";

/**
 * Boot: read the persisted folder, validate it, and pick the screen.
 * valid → workspace · missing → vault error · none → welcome.
 */
export function App() {
  const boot = useVaultStore((state) => state.boot);
  const booted = useVaultStore((state) => state.booted);
  const status = useVaultStore((state) => state.status);

  useEffect(() => {
    void boot();
  }, [boot]);

  // WebKit's own menu offers Reload and Inspect Element, which read as a web
  // page rather than an app. The app's menus are unaffected: Base UI and
  // Excalidraw call `preventDefault` in their own listeners, and every listener
  // still runs.
  // ponytail: blanket, so text fields lose the native copy/paste menu too —
  // ⌘C/⌘V still work. Exempt inputs here if that ever bites.
  useEffect(() => {
    const block = (event: MouseEvent) => event.preventDefault();
    document.addEventListener("contextmenu", block);
    return () => document.removeEventListener("contextmenu", block);
  }, []);

  // One mount for the whole app: `confirmAction` drives it from anywhere.
  const screen = !booted ? (
    <div className="h-full bg-ed-chrome" />
  ) : status === "ready" ? (
    <WorkspacePage />
  ) : status === "missing" ? (
    <VaultErrorPage />
  ) : (
    <WelcomePage />
  );

  return (
    <>
      {screen}
      <ConfirmDialog />
    </>
  );
}
