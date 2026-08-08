import { desktopSettings } from "@/shared/api/fs";

const PREFIX = "excalidesk:";

/**
 * The desktop shell cannot use `localStorage`: under `views://` CEF hands the
 * webview a throwaway profile, so everything is gone on quit. Settings live in a
 * bun-side JSON file instead, mirrored into this map by `hydrateSettings` before
 * the app boots — which is what keeps both accessors synchronous.
 */
const mirror = new Map<string, unknown>();

/** Serialised so a burst of saves cannot land out of order. */
let writing = Promise.resolve();

/** Must run before any store module reads a setting. See `src/bootstrap.ts`. */
export async function hydrateSettings(): Promise<void> {
  if (!desktopSettings) return;
  for (const [key, value] of Object.entries(await desktopSettings.readSettings())) {
    mirror.set(key, value);
  }
}

export function loadSetting<T>(key: string, fallback: T): T {
  if (desktopSettings) return mirror.has(key) ? (mirror.get(key) as T) : fallback;
  try {
    const raw = globalThis.localStorage?.getItem(PREFIX + key);
    return raw == null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function saveSetting(key: string, value: unknown): void {
  const bridge = desktopSettings;
  if (bridge) {
    mirror.set(key, value);
    const settings = Object.fromEntries(mirror);
    writing = writing.then(() => bridge.writeSettings(settings));
    return;
  }
  try {
    globalThis.localStorage?.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Storage unavailable (private mode / SSR) — settings just don't persist.
  }
}
