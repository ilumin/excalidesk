import type { ExcalidrawInitialDataState } from "@excalidraw/excalidraw/types";

import { fs } from "@/shared/api/fs";

export const emptyScene = (): ExcalidrawInitialDataState => ({
  elements: [],
  appState: {},
  files: {},
});

/**
 * Reads a sketch into Excalidraw's `initialData` shape.
 *
 * Returns null when there is nothing on disk. That is normal for a new untitled
 * tab and alarming for anything else, so the caller decides — this is the only
 * place that can tell the two apart.
 */
export async function readSketch(path: string): Promise<ExcalidrawInitialDataState | null> {
  const raw = await fs.readFile(path);
  if (raw === null) return null;
  if (!raw) return emptyScene();
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
    return emptyScene();
  }
}

/** `json` comes from Excalidraw's own `serializeAsJSON`, which strips transient state. */
export const writeSketch = (path: string, json: string) => fs.writeFile(path, json);
