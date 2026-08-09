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
