import { exportToBlob } from "@excalidraw/excalidraw";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

/**
 * ponytail: a browser download, because `shared/api/fs` only carries text and a
 * PNG is binary. When the desktop shell lands, swap this body for its save
 * panel — the menu item does not change.
 */
export async function exportScenePng(api: ExcalidrawImperativeAPI, name: string): Promise<void> {
  const blob = await exportToBlob({
    elements: api.getSceneElements(),
    appState: { ...api.getAppState(), exportBackground: false },
    files: api.getFiles(),
    mimeType: "image/png",
    quality: 1,
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${name}.png`;
  link.click();
  URL.revokeObjectURL(url);
}
