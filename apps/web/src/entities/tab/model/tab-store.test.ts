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

const paths = () => useTabStore.getState().tabs.map((tab) => tab.filePath);

test("retarget follows a renamed file, title and all", () => {
  useTabStore.getState().open(A, "permanent");
  useTabStore.getState().retarget(A, "/v/renamed.excalidraw");

  const [tab] = useTabStore.getState().tabs;
  expect(tab?.filePath).toBe("/v/renamed.excalidraw");
  expect(tab?.id).toBe("/v/renamed.excalidraw");
  expect(titles()).toEqual(["renamed"]);
  expect(useTabStore.getState().activeTabId).toBe("/v/renamed.excalidraw");
});

test("retarget follows every tab inside a moved directory, keeping them distinct", () => {
  const { open } = useTabStore.getState();
  open("/v/Work/a.excalidraw", "permanent");
  open("/v/Work/Deep/b.excalidraw", "permanent");
  useTabStore.getState().retarget("/v/Work", "/v/Archive/Work");

  expect(paths()).toEqual(["/v/Archive/Work/a.excalidraw", "/v/Archive/Work/Deep/b.excalidraw"]);
  expect(new Set(useTabStore.getState().tabs.map((tab) => tab.id)).size).toBe(2);
});

test("retarget leaves a merely similar prefix alone", () => {
  useTabStore.getState().open("/v/Workshop/a.excalidraw", "permanent");
  useTabStore.getState().retarget("/v/Work", "/v/Archive");

  expect(paths()).toEqual(["/v/Workshop/a.excalidraw"]);
});

test("retarget preserves dirty state", () => {
  useTabStore.getState().open(A, "permanent");
  useTabStore.getState().setDirty(A, true);
  useTabStore.getState().retarget(A, "/v/renamed.excalidraw");

  expect(useTabStore.getState().tabs[0]?.isDirty).toBe(true);
});

test("dropUnder closes tabs for a trashed folder and activates a survivor", () => {
  const { open } = useTabStore.getState();
  open(A, "permanent");
  open("/v/Work/gone.excalidraw", "permanent");
  useTabStore.getState().dropUnder("/v/Work");

  expect(paths()).toEqual([A]);
  expect(useTabStore.getState().activeTabId).toBe(A);
});

test("dropUnder clears the active tab when nothing survives", () => {
  useTabStore.getState().open("/v/Work/gone.excalidraw", "permanent");
  useTabStore.getState().dropUnder("/v/Work");

  expect(paths()).toEqual([]);
  expect(useTabStore.getState().activeTabId).toBeNull();
});

test("a new sketch is marked isNew, so an absent file is not alarming", () => {
  useTabStore.getState().createUntitled("/v");
  expect(useTabStore.getState().tabs[0]?.isNew).toBe(true);
});

test("markSaved clears new, missing and dirty together", () => {
  useTabStore.getState().createUntitled("/v");
  const id = useTabStore.getState().activeTabId!;
  useTabStore.getState().setMissing(id, true);
  useTabStore.getState().markSaved(id);

  const [tab] = useTabStore.getState().tabs;
  expect([tab?.isNew, tab?.missing, tab?.isDirty]).toEqual([false, false, false]);
});

test("retarget carries the missing flag across a rename", () => {
  useTabStore.getState().open(A, "permanent");
  useTabStore.getState().setMissing(A, true);
  useTabStore.getState().retarget(A, "/v/renamed.excalidraw");

  expect(useTabStore.getState().tabs[0]?.missing).toBe(true);
});
