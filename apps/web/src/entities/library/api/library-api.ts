import { restoreLibraryItems, serializeLibraryAsJSON } from "@excalidraw/excalidraw";
import type { LibraryItems } from "@excalidraw/excalidraw/types";

import { desktopLibrary, type LibraryBridge } from "@/shared/api/fs";

const BROWSER_KEY = "excalidesk:library";

/**
 * The desktop shells keep the library in their app data folder. In the browser
 * there is nowhere else to put it, and `localStorage` outlives the session
 * there — so a two-line stub rather than a second code path everywhere else.
 */
const store: LibraryBridge = desktopLibrary ?? {
  async readLibrary() {
    return globalThis.localStorage?.getItem(BROWSER_KEY) ?? null;
  },
  async writeLibrary(contents) {
    try {
      globalThis.localStorage?.setItem(BROWSER_KEY, contents);
    } catch {
      // Quota, or private mode — the library just doesn't persist.
    }
  },
};

/**
 * The library is global and the editor is remounted per tab, so the items must
 * be readable synchronously when `initialData` is built. This cache is what
 * survives that remount; the file is read once, at boot.
 */
let items: LibraryItems = [];

/** Serialised so a burst of adds cannot land out of order. */
let writing = Promise.resolve();

/** Must run before the first editor mounts. See `src/bootstrap.ts`. */
export async function hydrateLibrary(): Promise<void> {
  const raw = await store.readLibrary();
  if (raw === null) return;
  try {
    const parsed = JSON.parse(raw) as { libraryItems?: Parameters<typeof restoreLibraryItems>[0] };
    // `restoreLibraryItems` tolerates older versions and drops malformed entries.
    items = restoreLibraryItems(parsed.libraryItems, "unpublished");
  } catch {
    // A corrupt file must not block boot — start empty and leave it on disk, so
    // the user still has the chance to recover it by hand.
    console.warn("Could not read the saved library; starting with an empty one.");
  }
}

export const getLibraryItems = (): LibraryItems => items;

/** Excalidraw calls this on every add, remove, and reorder. */
export function saveLibraryItems(next: LibraryItems): void {
  items = next;
  const json = serializeLibraryAsJSON(next);
  writing = writing.then(() => store.writeLibrary(json));
}
