import type { FsNode } from "@/shared/api/fs";

export type VaultStatus = "none" | "ready" | "missing";

export interface RecentFolder {
  path: string;
  name: string;
  lastOpenedAt: number;
  missing?: boolean;
}

export interface VaultSnapshot {
  path: string | null;
  name: string;
  tree: FsNode[];
  status: VaultStatus;
}
