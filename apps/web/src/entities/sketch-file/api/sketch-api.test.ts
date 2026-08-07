import { expect, test } from "bun:test";

import { fs } from "@/shared/api/fs";

import { readSketch, writeSketch } from "./sketch-api";

const PATH = "/Users/me/Sketches/round-trip.excalidraw";

test("a sketch survives a write/read round trip", async () => {
  const elements = [{ id: "a", type: "rectangle", x: 1, y: 2 }];
  await writeSketch(PATH, JSON.stringify({ type: "excalidraw", version: 2, elements, files: {} }));

  const scene = await readSketch(PATH);
  expect(scene.elements).toEqual(elements as never);
});

test("a file that does not exist opens as an empty scene", async () => {
  const scene = await readSketch("/Users/me/Sketches/never-saved.excalidraw");
  expect(scene.elements).toEqual([]);
});

test("a corrupt file opens empty instead of throwing", async () => {
  const path = "/Users/me/Sketches/corrupt.excalidraw";
  await fs.writeFile(path, "{ not json");
  const scene = await readSketch(path);
  expect(scene.elements).toEqual([]);
});
