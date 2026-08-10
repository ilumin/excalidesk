export type FsNodeKind = "file" | "directory";

export interface FsNode {
  name: string;
  path: string;
  kind: FsNodeKind;
  /** Present on directories only. */
  children?: FsNode[];
}

/**
 * The single seam between the renderer and the filesystem. The desktop shell
 * (electrobun) injects an implementation on `window.excalidesk.fs`; the browser
 * build falls back to the in-memory sample vault. Nothing above `shared/api/fs`
 * may touch Node APIs.
 */
export interface FsBridge {
  pickDirectory(): Promise<string | null>;
  pickFile(extensions: string[]): Promise<string | null>;
  exists(path: string): Promise<boolean>;
  readTree(path: string): Promise<FsNode[]>;
  /** Returns null when the file does not exist yet (a new, unsaved sketch). */
  readFile(path: string): Promise<string | null>;
  writeFile(path: string, contents: string): Promise<void>;
  createFile(parentPath: string, name: string): Promise<FsNode>;
  createDirectory(parentPath: string, name: string): Promise<FsNode>;
  rename(path: string, nextName: string): Promise<void>;
  /** Moves an entry into `nextParentPath`, keeping its name. */
  move(path: string, nextParentPath: string): Promise<string>;
  trash(path: string): Promise<void>;
  reveal(path: string): Promise<void>;
}

/**
 * Settings ride the same seam. Under `views://` the webview's `localStorage` is
 * thrown away on quit, so the desktop build keeps them in a bun-side JSON file.
 */
export interface SettingsBridge {
  readSettings(): Promise<Record<string, unknown>>;
  writeSettings(settings: Record<string, unknown>): Promise<void>;
}

/**
 * Native window chrome the UI drives itself. Electrobun's preload only handles
 * dragging, so double-click-to-zoom on the title bar comes through here.
 */
export interface WindowBridge {
  /** macOS zoom: fills the screen, or restores the previous frame. */
  toggleMaximize(): Promise<void>;
}

export type DesktopApi = FsBridge & SettingsBridge & WindowBridge;

/**
 * The same contract as an RPC request map — one request per method, params are
 * the argument tuple. Both sides of the electrobun seam build their schema from
 * this, so a signature change breaks type-check in the bun process too.
 */
export type DesktopRequests = {
  [K in keyof DesktopApi]: {
    params: Parameters<DesktopApi[K]>;
    response: Awaited<ReturnType<DesktopApi[K]>>;
  };
};
