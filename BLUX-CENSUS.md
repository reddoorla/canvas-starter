# Blux fleet census — 2026-07-05

Local-only (git-excluded, like [FLEET.md](FLEET.md) / [GAPS.md](GAPS.md)). Source:
the 11 `site.json` exports Tucker downloaded to `~/Desktop/` on 2026-07-05.
Derived by `blux-census.mjs` (in scratch); raw output in `BLUX-CENSUS.json`.
This scopes GAPS **NOW #3** (Blux export archive + block census) and the whole
LATER conversion track.

## TL;DR — the conversion is small on engineering, heavy on media

- **11 sites, ~1,700 content blocks — but they collapse to 4 archetypes.** The
  entire fleet is composed of: `heading+text+media` (569), `heading+text` (495),
  a generic grid/column `container` (309+61 variants), and `hero/banner`
  (bg-media + copy, 256). That's it. Blux is a **freeform block builder**, not a
  typed-component CMS, so there is no long tail of bespoke block types to port.
  **~5 flexible Prismic slices cover every page on every site.**
- **All 11 sites are structurally near-identical** (archetype-cosine ≥ 0.96 for
  essentially every pair). One importer/pipeline covers the fleet — not just the
  6 Worthe properties. The Worthe subset shares _design_ too; the others share
  only the _block vocabulary_.
- **3,766 media assets — and 0 of them are in the exports.** Every image/video
  is referenced from Blux's CloudFront (`d3syaxnfm3oj0e.cloudfront.net` images,
  `dv4tl7yyk1zlp.cloudfront.net` video). The download captured structure, not
  pixels. **This is the #1 risk and the #1 next action: mirror the CDN before
  anything else** — Blux is a one-man platform with an outage history, and if it
  goes dark these client assets are unrecoverable.

## The slice inventory (engineering scope)

| Blux archetype                  |         fleet count | → Prismic slice                                                          | notes                                                |
| ------------------------------- | ------------------: | ------------------------------------------------------------------------ | ---------------------------------------------------- |
| `heading + text + media`        |                 569 | **MediaText** (image/video + rich text, side-by-side, `ratio` + reverse) | the workhorse; `ratio` field already present         |
| `heading + text`                |                 495 | **RichText** (already in starter)                                        | extend starter's existing slice                      |
| `container` (grid/blocks0-5)    |                 375 | **Section / Grid** (N-column wrapper holding child blocks)               | `class` = column count; drives nesting (max depth 4) |
| `hero/banner (bg-media + copy)` |                 256 | **Hero** (starter has `HeroBackgroundImage`)                             | `backgroundMedia` + `loadEffect` anim                |
| `carousel/slides`               | (in `class=slides`) | **Slider** (starter PR #39 ✅)                                           | already built in Wave-2                              |
| `bare media`                    |                   2 | fold into MediaText                                                      | negligible                                           |

Net new slices to build: **MediaText, Hero, Section/Grid** (RichText + Slider
already exist in the starter). Everything else is composition. The Roalson
listing/map slices (GAPS #7) are the _only_ data-driven slices not represented
here — Blux sites are all static content.

## Fleet at a glance

| site                   | domain                     | pages | blocks | depth |    media | nav |
| ---------------------- | -------------------------- | ----: | -----: | ----: | -------: | --: |
| strategyAdvantage      | strategyadvantage.com      |     6 |    273 |     3 |      230 |   6 |
| theBurbankPortfolio    | theburbankportfolio.com    |     8 |    257 |     3 |      302 |   5 |
| mediaStudios           | mediastudiosburbank.com    |     7 |    200 |     3 |      374 |   6 |
| compositionHospitality | compositionhospitality.com |     8 |    194 |     3 | **1564** |   6 |
| fitHealthClub          | tbpfit.com                 |     5 |    185 |     4 |      110 |  11 |
| thePinnacle            | thepinnacleburbank.com     |     3 |    125 |     3 |      296 |   5 |
| theTower               | thetowerburbank.com        |     3 |    122 |     4 |      285 |   5 |
| thePointe              | thepointeburbank.com       |     2 |    115 |     3 |      320 |   5 |
| xcoSite                | xcoadvantage.com           |     3 |     90 |     4 |      102 |   4 |
| oceanAvenueProject     | oceanavenueproject.com     |    11 |     74 |     2 |       57 |   6 |
| williamsonHomes        | williamson-homes.com       |     4 |     62 |     3 |      126 |   4 |

**Worthe cluster (6):** theBurbankPortfolio, thePinnacle, theTower, thePointe,
oceanAvenueProject, mediaStudios — all `*burbank`/Worthe real-estate, shared
design. **fitHealthClub** (tbpfit.com = "The Burbank Portfolio fit") is
Worthe-adjacent. **Independents (4):** strategyAdvantage, xcoSite (advantage
brand), compositionHospitality (566-product catalog — the outlier at 1,564
assets), williamsonHomes.

## Media reality (the load-bearing risk)

- **3,766 assets fleet-wide**, ~96% images, plus ~44 videos and small counts of
  `custom`/`application`/`form` widgets. compositionHospitality alone is 1,564
  (its product catalog).
- Every asset's canonical URL is **reconstructable from `site.json`**: the
  `media` map keys are asset UUIDs and each entry carries `siteID`, so
  `https://d3syaxnfm3oj0e.cloudfront.net/<siteID>/<uuid>.<ext>` (images support
  on-the-fly `/w:NNN/from:jpg/` resizing; video uses the `dv4tl7…` host). A
  mirror script can walk all 11 media maps and pull originals — **no crawl of the
  rendered HTML needed.**
- Design tokens are trivial: all sites use Blux's 7-color palette slots; text
  styles range 5–16. A per-site theme is ~7 colors + a font pair (in
  `settings.fonts`) + a handful of text styles. Cheap to port.

## Conversion approach (proposed)

1. **Mirror media first** (script over the 11 `media` maps → local/bucket, keyed
   by site+uuid). Non-negotiable, time-sensitive.
2. **Build the 3 new starter slices** (MediaText, Hero, Section/Grid) — reuses
   existing RichText/Slider/HeroBackgroundImage.
3. **Write one Blux→Prismic importer**: walk `content.pages[].items` recursively,
   map each block to a slice by its capability signature (the archetype logic in
   `blux-census.mjs` is the seed), rewrite media UUIDs → migrated asset URLs, emit
   Prismic documents. Uniform block model = one importer for all 11 sites.
4. **Per-site theme** from `styles` + `settings.fonts`.
5. Worthe 6 share design → build/tune the importer on one (e.g. thePinnacle, 3
   pages, clean), then the other 5 are near-free.

## What's captured vs. what's still at risk

- ✅ **Structure/content/nav/footer/styles** — safe on the desktop (these JSONs).
- ✅ **Rendered HTML + sitemaps** — present per folder (fallback reference).
- ❌ **Binary media (3,766 assets)** — remote-only on Blux CloudFront. **Mirror ASAP.**
- ❓ **Forms / widgets** — `settings.widgets` + `form`-type media exist; contact
  forms will need re-wiring to the reddoor central ingest (not a Blux carry-over).
- ❓ **compositionHospitality's 566-product catalog** — this is a data set, not
  page content; likely wants a Prismic repeatable type or a different home.
