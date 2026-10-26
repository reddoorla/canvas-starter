# Canvas Starter — Work Journal

Running log of build work: what was done, why, and where it landed.
Chronological — newest entry at the bottom. [README.md](../README.md) says what
the prototype does; this is the history of getting it there.

The convention is in [CLAUDE.md](../CLAUDE.md) under "The work journal". In
short: every working session appends a dated entry, prose over bullets, why
over what, and history is never edited to be right — a later entry corrects an
earlier one and says so.

---

## 2026-09-05 — Journal opened, and 29 commits summarised rather than reconstructed (`chore/work-journal`)

The journal starts today, so this first entry is a **backfill**: a coarse
summary written from the commit log, not from memory. Detail below this line is
trustworthy; detail above it is not, and nothing here should be cited as though
someone wrote it down at the time. For anything before 2026-09-05 the commit
log is the record.

**What this repo is.** A public prototype of a 2D "navigating a canvas"
interaction — full-viewport slides on a grid, where one gesture (arrow keys,
WASD, wheel, swipe) moves exactly one cell toward a filled neighbour and the
whole board glides. Inspired by bodeyco.com, extended from one scroll axis to
two. Four layouts come from one row-major config in
`src/lib/canvas/presets.ts`. Scaffolded from `reddoor-starter` with Prismic
left as an inert stub rather than deleted, so the prototype could be promoted
to a template if the interaction felt right. Deployed on Netlify as
`canvas-starter-591`.

**The eras, and there are only two.** **The whole thing was built on
2026-07-24** — 13 of the repo's 29 commits, in dependency order: design spec,
implementation plan, scaffold, then pure navigation logic with unit tests, the
Slide cell, the Canvas engine, arrows and minimap, the layout switcher, and
finally mounting the canvas at `/` and dropping the global Nav/Footer for it.

**Everything since is maintenance, not development.** The remaining 16 commits
run 2026-07-28 to 2026-09-01 and are almost entirely Renovate and CI — 12 are
dependency bumps or CI wiring (Renovate authenticating as the reddoor-renovate
GitHub App, `netlify-site` pointed at `canvas-starter-591`, CI running on
`staging`, the shared reusable workflow taken at v1.4.1). Only two touched
code: #4 relaxed the smoke suite's home-page expectation to "200 with a `main`
landmark", because the canvas replaced the starter's homepage, and #20 capped
Prismic srcset widths across the _inherited_ starter slices, which the canvas
route does not use. Nobody has extended the interaction since the day it was
written.

**State as of this entry.** `main` at `980508d` (2026-09-01), tree clean,
branched to `chore/work-journal` for this change. Two Renovate branches sit
unmerged at origin (`renovate/all-minor-patch`, `renovate/jsdom-30.x`), and
`ci/run-on-staging` is merged but undeleted. `slicemachine.config.json` still
holds the `your-prismic-repo-name` sentinel — that is the design, not neglect.

**What changed today.** `CLAUDE.md` did not exist here; it does now, carrying
what the repo is, how to run it, and the work-journal convention. This file is
the journal.

## 2026-10-26 — SvelteKit 3 and adapter-netlify 7 (kit 3 migration PR)

Kit 2.70.3 → 3.1.0 and adapter-netlify 6.0.4 → 7.0.1, for GHSA-27mw-82g8-phjj. This supersedes Renovate's #41 and #32. The operator chose to migrate this repo as one PR into `main` (`reddoor-workspace` `decisions/2026-10-26-1613-canvas-starter-kit3-or-archive.md`), although his 10-20 answer to Operator decisions 97(c) had been to archive it.

The native starter's migration (reddoor-starter#187 and #188) was the recipe, but it was not cherry-picked. The fork is old enough that the cherry-pick conflicted in 25 files, most of them files this repo never had. So each change was ported by hand from the starter's diff:

- the config moved into `sveltekit.config.js`, flattened and passed to `sveltekit(kitConfig)`;
- `src/params.ts`, `src/env.ts` and `$app/tsconfig`;
- the `$app/env` and `$app/navigation` imports;
- string `error()` bodies;
- the getter mocks;
- the vendored `PrismicPreview`;
- `$lib/seo`'s `siteOrigin`.

The policy stayed as this repo had it; none of the starter's later CSP additions came across.

Belief corrected on contact: that the starter's port covers the prerendered origin. In the starter, robots.txt and sitemap.xml answer per request (#140). Here they are still prerendered, and they read `url.origin`, which kit 2 filled from `prerender.origin`. Kit 3 has no such option (and `paths.origin` would also become the only origin the CSRF check accepts), so with the starter's port alone, production's robots.txt would have advertised `http://sveltekit-prerender/sitemap.xml`. Both now go through `siteOrigin`, as do `ProductDetail`'s share links. That is the same defect reddoor-starter-blux#51's review found in the identical component. Each reader has a prerender test that fails when its `url.origin` or `page.url.href` comes back.

Measured on production builds:

- **`URL` set to the site's origin:** 8 built files outside `_app/immutable`; 3 carry the production origin, none the placeholder. The robots.txt line and the home canonical match what canvas-starter-591.netlify.app serves today.
- **`URL` unset:** `index.html`, `robots.txt` and `slice-simulator.html` carry the placeholder.
- **Against `main`, built the same way:** every route's status is the same, the served CSP header is identical apart from its nonce, and `/health` is the same with the three form variables set.
- **The brief's "drop `csp`" mutation does not apply:** nothing in this repo reads the config's CSP.
- **Checks:** svelte-check 0/0; 457 unit tests; 5 smoke tests.
