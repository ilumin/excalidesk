import { Excalidraw, serializeAsJSON } from "@excalidraw/excalidraw";
import type {
  ExcalidrawImperativeAPI,
  ExcalidrawInitialDataState,
} from "@excalidraw/excalidraw/types";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useRef, useState } from "react";

import { readSketch, writeSketch } from "@/entities/sketch-file";
import { useTabStore } from "@/entities/tab";
import { useEditorStore } from "@/features/editor-controls";
import { CanvasPanel } from "@/shared/ui";

import "@excalidraw/excalidraw/index.css";
import "./excalidraw-theme.css";

const SAVE_DELAY = 800;

/**
 * Excalidraw owns the drawing surface, its own tool island, style panel, and
 * zoom control — all three already sit where the design reference puts them.
 * This widget supplies the panel chrome, the dotted background (the scene
 * renders on a transparent canvas above it), and the file <-> scene wiring.
 */
export function CanvasStage({ flush }: { flush?: boolean }) {
  const { resolvedTheme } = useTheme();
  const activeTabId = useTabStore((state) => state.activeTabId);
  const filePath = useTabStore(
    (state) => state.tabs.find((tab) => tab.id === state.activeTabId)?.filePath,
  );
  const setDirty = useTabStore((state) => state.setDirty);
  const setEditorApi = useEditorStore((state) => state.setApi);
  const compact = useEditorStore((state) => state.compact);

  const [scene, setScene] = useState<ExcalidrawInitialDataState | null>(null);
  const api = useRef<ExcalidrawImperativeAPI | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  /** Serialized scene as last written; null until the first idle after load. */
  const saved = useRef<string | null>(null);

  useEffect(() => {
    saved.current = null;
    if (!filePath) {
      setScene(null);
      return;
    }
    let cancelled = false;
    void readSketch(filePath).then((next) => {
      if (!cancelled) setScene(next);
    });
    return () => {
      cancelled = true;
    };
  }, [filePath]);

  useEffect(() => () => clearTimeout(saveTimer.current), []);

  // ponytail: debounced write-through rather than an explicit save command —
  // local files, single writer, no conflict story yet.
  const scheduleSave = useCallback(() => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const editor = api.current;
      if (!editor || !filePath || !activeTabId) return;
      const json = serializeAsJSON(
        editor.getSceneElements(),
        editor.getAppState(),
        editor.getFiles(),
        "local",
      );
      // First settle after opening a file only records the on-disk state, so
      // merely viewing a sketch never rewrites it.
      if (saved.current === null || json === saved.current) {
        saved.current = json;
        setDirty(activeTabId, false);
        return;
      }
      void writeSketch(filePath, json).then(() => {
        saved.current = json;
        setDirty(activeTabId, false);
      });
    }, SAVE_DELAY);
  }, [activeTabId, filePath, setDirty]);

  return (
    // Focus mode drops the inset and border so the canvas meets the window.
    <CanvasPanel className={flush ? "m-0 rounded-none border-0 shadow-none" : undefined}>
      <div
        className="ed-canvas relative flex-1 overflow-hidden"
        data-compact={compact ? "" : undefined}
        style={{
          backgroundImage: "radial-gradient(var(--ed-dots) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      >
        {filePath && scene ? (
          <Excalidraw
            // Remount on tab switch so each sketch gets its own scene + history.
            key={activeTabId}
            excalidrawAPI={(editor) => {
              api.current = editor;
              // Published so the settings menu can drive the library sidebar.
              setEditorApi(editor);
            }}
            initialData={{
              ...scene,
              appState: { ...scene.appState, viewBackgroundColor: "transparent" },
              scrollToContent: true,
            }}
            theme={resolvedTheme === "dark" ? "dark" : "light"}
            UIOptions={{ canvasActions: { changeViewBackgroundColor: false, loadScene: false } }}
            onChange={() => {
              if (activeTabId && saved.current !== null) setDirty(activeTabId, true);
              scheduleSave();
            }}
          />
        ) : null}
      </div>
    </CanvasPanel>
  );
}
