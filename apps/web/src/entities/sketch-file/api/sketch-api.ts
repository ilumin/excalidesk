import type { ExcalidrawInitialDataState } from "@excalidraw/excalidraw/types";

import { fs } from "@/shared/api/fs";

/**
 * Reads a sketch into Excalidraw's `initialData` shape. A file that does not
 * exist yet (a new untitled tab) opens as an empty scene rather than an error.
 */
export async function readSketch(path: string): Promise<ExcalidrawInitialDataState> {
  const raw = await fs.readFile(path);
  if (!raw) return { elements: [], appState: {}, files: {} };
  try {
    const parsed = JSON.parse(raw) as ExcalidrawInitialDataState;
    return {
      elements: parsed.elements ?? [],
      appState: parsed.appState ?? {},
      files: parsed.files ?? {},
    };
  } catch {
    // A corrupt file should not take the app down — open it empty so the user
    // has to overwrite it deliberately.
    return { elements: [], appState: {}, files: {} };
  }
}

/** `json` comes from Excalidraw's own `serializeAsJSON`, which strips transient state. */
export const writeSketch = (path: string, json: string) => fs.writeFile(path, json);
