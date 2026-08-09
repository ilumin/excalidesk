import { Excalidraw, serializeAsJSON } from "@excalidraw/excalidraw";
import type {
  ExcalidrawImperativeAPI,
  ExcalidrawInitialDataState,
} from "@excalidraw/excalidraw/types";
import { TriangleAlert } from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useRef, useState } from "react";

import { emptyScene, readSketch, writeSketch } from "@/entities/sketch-file";
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
  // Select the flag, never the tab object: subscribing to the object would
  // re-render on every `setDirty`, which re-renders Excalidraw, which fires
  // `onChange`, which sets dirty again — an update loop.
  const missing = useTabStore(
    (state) => state.tabs.find((tab) => tab.id === state.activeTabId)?.missing === true,
  );
  const setDirty = useTabStore((state) => state.setDirty);
  const setMissing = useTabStore((state) => state.setMissing);
  const markSaved = useTabStore((state) => state.markSaved);
  const setEditorApi = useEditorStore((state) => state.setApi);
  const compact = useEditorStore((state) => state.compact);

  const [scene, setScene] = useState<ExcalidrawInitialDataState | null>(null);
  const api = useRef<ExcalidrawImperativeAPI | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  /** Serialized scene as last written; null until the first idle after load. */
  const saved = useRef<string | null>(null);

  // The published handle must not outlive the editor it points at, or the
  // settings menu keeps offering canvas actions after the vault is closed.
  useEffect(() => () => setEditorApi(null), [setEditorApi]);

  useEffect(() => {
    // A save queued against the previous path would recreate the file the user
    // just renamed or moved away from.
    clearTimeout(saveTimer.current);
    saved.current = null;
    if (!filePath) {
      setScene(null);
      setEditorApi(null);
      return;
    }
    let cancelled = false;
    void readSketch(filePath).then((next) => {
      if (cancelled) return;
      // Nothing on disk is expected for a sketch that has never been saved, and
      // means the file was deleted underneath us for anything else.
      if (activeTabId) {
        const tab = useTabStore.getState().tabs.find((candidate) => candidate.id === activeTabId);
        setMissing(activeTabId, next === null && tab?.isNew !== true);
      }
      setScene(next ?? emptyScene());
    });
    return () => {
      cancelled = true;
    };
  }, [activeTabId, filePath, setEditorApi, setMissing]);

  useEffect(() => () => clearTimeout(saveTimer.current), []);

  const serialize = () => {
    const editor = api.current;
    if (!editor) return null;
    return serializeAsJSON(
      editor.getSceneElements(),
      editor.getAppState(),
      editor.getFiles(),
      "local",
    );
  };

  // ponytail: debounced write-through rather than an explicit save command —
  // local files, single writer, no conflict story yet.
  const scheduleSave = useCallback(() => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      if (!filePath || !activeTabId) return;
      // The file is gone; recreating it silently is not ours to decide.
      if (useTabStore.getState().tabs.find((tab) => tab.id === activeTabId)?.missing) return;
      const json = serialize();
      if (json === null) return;
      // First settle after opening a file only records the on-disk state, so
      // merely viewing a sketch never rewrites it.
      if (saved.current === null || json === saved.current) {
        saved.current = json;
        setDirty(activeTabId, false);
        return;
      }
      void writeSketch(filePath, json).then(() => {
        saved.current = json;
        markSaved(activeTabId);
      });
    }, SAVE_DELAY);
  }, [activeTabId, filePath, markSaved, setDirty]);

  /** The user's answer to "this file is gone": put it back, then resume. */
  const restore = () => {
    const json = serialize();
    if (!filePath || !activeTabId || json === null) return;
    void writeSketch(filePath, json).then(() => {
      saved.current = json;
      markSaved(activeTabId);
    });
  };

  return (
    // Focus mode drops the inset and border so the canvas meets the window.
    <CanvasPanel className={flush ? "m-0 rounded-none border-0 shadow-none" : undefined}>
      {missing ? (
        <div className="flex flex-none items-center gap-2 border-b border-ed-danger-edge bg-ed-danger-bg px-3 py-2 text-[12px] text-ed-danger-ink">
          <TriangleAlert size={13} strokeWidth={1.6} className="flex-none text-ed-danger" />
          <span className="min-w-0 flex-1 truncate">
            This file is no longer on disk. Edits are not being saved.
          </span>
          <button
            type="button"
            onClick={restore}
            className="flex-none rounded-[5px] border border-ed-danger-edge px-2 py-0.5 font-medium hover:bg-ed-danger-body"
          >
            Save it back
          </button>
        </div>
      ) : null}
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
