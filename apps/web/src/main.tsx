import { hydrateSettings } from "./shared/lib";

// Stores read their settings at module scope, so the app graph must not
// evaluate until the desktop shell has handed them over. A dynamic import is
// the only ordering the bundler cannot collapse.
await hydrateSettings();
await import("./mount");
