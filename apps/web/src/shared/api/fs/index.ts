import { browserFs } from "./browser-fs";
import type { FsBridge } from "./types";

declare global {
  interface Window {
    excalidesk?: { fs?: FsBridge };
  }
}

export const fs: FsBridge = globalThis.window?.excalidesk?.fs ?? browserFs;

export type { FsBridge, FsNode, FsNodeKind } from "./types";
