import { beforeEach, expect, test } from "bun:test";

import { useTabStore } from "./tab-store";

const A = "/v/a.excalidraw";
const B = "/v/b.excalidraw";
const C = "/v/c.excalidraw";

const titles = () => useTabStore.getState().tabs.map((tab) => `${tab.title}${tab.preview ? "~" : ""}`);

beforeEach(() => useTabStore.getState().reset([], null));

test("a single click reuses the one preview slot", () => {
  const { open } = useTabStore.getState();
  open(A);
  open(B);
  expect(titles()).toEqual(["b~"]);
  expect(useTabStore.getState().activeTabId).toBe(B);
});

test("a double click keeps the tab, so the next click opens beside it", () => {
  const { open } = useTabStore.getState();
  open(A);
  open(A, "permanent");
  expect(titles()).toEqual(["a"]);
  open(B);
  expect(titles()).toEqual(["a", "b~"]);
});

test("a kept tab is never replaced by a preview", () => {
  const { open } = useTabStore.getState();
  open(A, "permanent");
  open(B, "permanent");
  open(C);
  expect(titles()).toEqual(["a", "b", "c~"]);
});

test("editing a preview keeps it", () => {
  const { open, setDirty } = useTabStore.getState();
  open(A);
  setDirty(A, true);
  expect(titles()).toEqual(["a"]);
  useTabStore.getState().open(B);
  expect(titles()).toEqual(["a", "b~"]);
});

test("reopening a file activates its existing tab instead of duplicating", () => {
  const { open } = useTabStore.getState();
  open(A, "permanent");
  open(B, "permanent");
  open(A);
  expect(titles()).toEqual(["a", "b"]);
  expect(useTabStore.getState().activeTabId).toBe(A);
});
