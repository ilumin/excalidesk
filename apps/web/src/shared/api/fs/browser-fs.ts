import type { FsBridge, FsNode } from "./types";

const dir = (path: string, children: FsNode[]): FsNode => ({
  name: path.slice(path.lastIndexOf("/") + 1),
  path,
  kind: "directory",
  children,
});

const file = (path: string): FsNode => ({
  name: path.slice(path.lastIndexOf("/") + 1),
  path,
  kind: "file",
});

/** The sample vault from the design handoff. */
function sampleTree(root: string): FsNode[] {
  return [
    dir(`${root}/Ideas`, []),
    dir(`${root}/Work`, [
      dir(`${root}/Work/Diagrams`, [
        file(`${root}/Work/Diagrams/system-map.excalidraw`),
        file(`${root}/Work/Diagrams/onboarding-flow.excalidraw`),
      ]),
      dir(`${root}/Work/Meetings`, []),
    ]),
    file(`${root}/quick-note.excalidraw`),
    file(`${root}/scratchpad.excalidraw`),
  ];
}

const trees = new Map<string, FsNode[]>();
const contents = new Map<string, string>();

function treeFor(root: string): FsNode[] {
  let tree = trees.get(root);
  if (!tree) {
    tree = sampleTree(root);
    trees.set(root, tree);
  }
  return tree;
}

function walk(nodes: FsNode[], visit: (node: FsNode, siblings: FsNode[]) => void): void {
  for (const node of nodes) {
    visit(node, nodes);
    if (node.children) walk(node.children, visit);
  }
}

function findChildren(root: string, path: string): FsNode[] {
  const tree = treeFor(root);
  if (path === root) return tree;
  let found: FsNode[] | undefined;
  walk(tree, (node) => {
    if (node.path === path && node.children) found = node.children;
  });
  return found ?? tree;
}

function rootOf(path: string): string {
  for (const root of trees.keys()) if (path === root || path.startsWith(`${root}/`)) return root;
  return path;
}

/**
 * ponytail: in-memory stub so every screen renders in the browser and in
 * Storybook. Replace wholesale with the electrobun bridge — the interface is the
 * contract, no caller changes.
 */
export const browserFs: FsBridge = {
  async pickDirectory() {
    return "/Users/me/Sketches";
  },
  async pickFile() {
    return "/Users/me/Sketches/quick-note.excalidraw";
  },
  async exists(path) {
    return !path.includes("/Documents/Sketches");
  },
  async readTree(path) {
    return treeFor(path);
  },
  async readFile(path) {
    return contents.get(path) ?? null;
  },
  async writeFile(path, next) {
    contents.set(path, next);
  },
  async createFile(parentPath, name) {
    const node = file(`${parentPath}/${name}`);
    findChildren(rootOf(parentPath), parentPath).push(node);
    return node;
  },
  async createDirectory(parentPath, name) {
    const node = dir(`${parentPath}/${name}`, []);
    findChildren(rootOf(parentPath), parentPath).push(node);
    return node;
  },
  async rename(path, nextName) {
    walk(treeFor(rootOf(path)), (node) => {
      if (node.path === path) {
        node.name = nextName;
        node.path = `${path.slice(0, path.lastIndexOf("/"))}/${nextName}`;
      }
    });
  },
  async move(path, nextParentPath) {
    const root = rootOf(path);
    let moved: FsNode | undefined;
    walk(treeFor(root), (node, siblings) => {
      if (node.path === path) {
        moved = node;
        siblings.splice(siblings.indexOf(node), 1);
      }
    });
    if (!moved) return path;

    const nextPath = `${nextParentPath}/${moved.name}`;
    // Re-root the subtree so every descendant path stays consistent.
    const rebase = (node: FsNode, parent: string) => {
      node.path = `${parent}/${node.name}`;
      const body = contents.get(node.path);
      if (body !== undefined) contents.set(node.path, body);
      node.children?.forEach((child) => rebase(child, node.path));
    };
    const body = contents.get(path);
    rebase(moved, nextParentPath);
    if (body !== undefined) {
      contents.delete(path);
      contents.set(nextPath, body);
    }
    findChildren(root, nextParentPath).push(moved);
    return nextPath;
  },

  async trash(path) {
    walk(treeFor(rootOf(path)), (node, siblings) => {
      if (node.path === path) siblings.splice(siblings.indexOf(node), 1);
    });
  },
  async reveal() {
    // No Finder in the browser.
  },
};
