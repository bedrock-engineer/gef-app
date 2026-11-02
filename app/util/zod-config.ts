import { z } from "zod";

// Zod probes eval support with `new Function("")` the first time an object
// schema is constructed. Our CSP has no 'unsafe-eval', so the probe is
// harmless but reports a violation to Sentry on every page load. Jitless mode
// skips the probe.
//
// This must run before gef-parser builds its schemas at module-evaluation
// time. React Router evaluates the route modules (root, home → gef-parser)
// before entry.client's body, so configuring Zod there is too late. Instead
// vite.config.ts bundles this module into the "zod" chunk, so it executes as
// part of Zod's own chunk and ahead of every chunk that imports Zod.
z.config({ jitless: true });
