import { hydrateLibrary } from "./entities/library";
import { hydrateSettings } from "./shared/lib";

// Stores read their settings at module scope, so the app graph must not
// evaluate until the desktop shell has handed them over. A dynamic import is
// the only ordering the bundler cannot collapse.
//
// The library is read here for the same reason: `canvas-stage` builds
// `initialData` synchronously on every tab switch.
await Promise.all([hydrateSettings(), hydrateLibrary()]);
await import("./mount");
