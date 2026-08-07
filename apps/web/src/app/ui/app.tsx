import { useEffect } from "react";

import { useVaultStore } from "@/entities/vault";
import { VaultErrorPage } from "@/pages/vault-error";
import { WelcomePage } from "@/pages/welcome";
import { WorkspacePage } from "@/pages/workspace";

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

  if (!booted) return <div className="h-full bg-ed-chrome" />;
  if (status === "ready") return <WorkspacePage />;
  if (status === "missing") return <VaultErrorPage />;
  return <WelcomePage />;
}
