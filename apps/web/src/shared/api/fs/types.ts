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
  createFile(parentPath: string, name: string): Promise<FsNode>;
  createDirectory(parentPath: string, name: string): Promise<FsNode>;
  rename(path: string, nextName: string): Promise<void>;
  trash(path: string): Promise<void>;
  reveal(path: string): Promise<void>;
}
