/** `/Users/me/Documents/Sketches` → `~/Documents/Sketches` */
export function tildify(path: string, home = "/Users/me"): string {
  return path.startsWith(home) ? `~${path.slice(home.length)}` : path;
}

/** `/a/b/c` → `/a/b` (already tildified paths keep their `~`). */
export function parentPath(path: string): string {
  const at = path.lastIndexOf("/");
  return at <= 0 ? path : path.slice(0, at);
}

export function basename(path: string): string {
  return path.slice(path.lastIndexOf("/") + 1);
}

/** Drops the `.excalidraw` suffix for tab titles. */
export function stripExtension(name: string): string {
  const at = name.lastIndexOf(".");
  return at <= 0 ? name : name.slice(0, at);
}

const UNITS: [limit: number, ms: number, label: string][] = [
  [60_000, 1_000, "second"],
  [3_600_000, 60_000, "minute"],
  [86_400_000, 3_600_000, "hour"],
  [604_800_000, 86_400_000, "day"],
  [2_592_000_000, 604_800_000, "week"],
  [31_536_000_000, 2_592_000_000, "month"],
];

export function relativeTime(timestamp: number, now = Date.now()): string {
  const elapsed = Math.max(0, now - timestamp);
  const format = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  for (const [limit, ms, label] of UNITS) {
    if (elapsed < limit) {
      return format.format(-Math.floor(elapsed / ms), label as Intl.RelativeTimeFormatUnit);
    }
  }
  return format.format(-Math.floor(elapsed / 31_536_000_000), "year");
}
