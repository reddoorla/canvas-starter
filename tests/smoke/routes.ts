// Committed per-site smoke manifest. `tests/smoke/pages.spec.ts` iterates this
// list, asserting each route returns its expected status and paints a hydration
// marker with no console errors. Grow the list as real routes land (add
// `{ path, name, hydrationMarker }` entries).

export type SmokeRoute = {
  /** Route path to visit, e.g. "/" or "/about". */
  path: string;
  /** Human-readable label used in the test title. */
  name: string;
  /** CSS selector asserted visible after load (hydration proof). Default: skip. */
  hydrationMarker?: string;
  /** Expected HTTP status. Default: 200. */
  expectStatus?: number;
};

export const smokeRoutes: SmokeRoute[] = [
  // The canvas app mounts at `/` independent of Prismic (f315d73), so home
  // renders 200 even against the placeholder repo — the starter's
  // placeholder-gated 404 expectation no longer applies here. The canvas
  // route ships no global footer (9dc2bab); the skip-link's <main> target is
  // the stable landmark instead.
  { path: "/", name: "home (canvas)", hydrationMarker: "main#main-content" },
];
