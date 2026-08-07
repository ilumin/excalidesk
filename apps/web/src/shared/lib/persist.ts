const PREFIX = "excalidesk:";

/**
 * ponytail: localStorage stands in for the desktop settings file (electron-store /
 * electrobun's app data dir). Swap the two bodies below when the shell lands —
 * every caller already goes through here.
 */
export function loadSetting<T>(key: string, fallback: T): T {
  try {
    const raw = globalThis.localStorage?.getItem(PREFIX + key);
    return raw == null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function saveSetting(key: string, value: unknown): void {
  try {
    globalThis.localStorage?.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Storage unavailable (private mode / SSR) — settings just don't persist.
  }
}
