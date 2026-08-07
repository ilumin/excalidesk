import type { FsNode } from "@/shared/api/fs";

export type SketchNode = FsNode;

export const SKETCH_EXTENSION = ".excalidraw";

export const isSketchFile = (node: SketchNode): boolean =>
  node.kind === "file" && node.name.endsWith(SKETCH_EXTENSION);
