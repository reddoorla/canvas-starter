# Fleet/stack gap proposals — 2026-07-02

Companion to [FLEET.md](FLEET.md) (context) — local-only, git-excluded. Sources:
4-lens analysis (blux lens ran as agents; new-site / fleet-ops / client-lifecycle
lenses authored from the same recon after a session-limit interruption), plus
live Airtable readiness verification. Impact/effort tags; sequenced into four
horizons.

## NOW — this week, alongside the announcement rollout

1. **Rollout data hygiene** (high, S) — before each announce: clear ERP's
   `Report recipients (To)` override (currently tucker@reddoorla.com — would
   divert the client send from bberry@erpfunds.com); verify MSOT's
   `point of contact` (albert@revogenbiologics.com — identical to Revogen's);
   resolve the 8 unsent report drafts (5 fresh Maintenance from the 07-02 cron
   - 3 stale Testing from 2025-02/2026-01/2026-06) so no client gets a
     Maintenance report before their Announcement; set `maintenance day`/
     `testing day` anchors = send date per the Sonder playbook; ERP/Reddoor have
     stale 2025 testing anchors. Optionally review header images per Erik's
     "timeless hero" feedback (07-01).
2. **Rotate the committed Gmail app password** (high, S, human-only) —
   `tucksravin/reddoor-mailer` `src/index.ts:18` has a live app password for
   contact@tuckerlemos.com committed to GitHub since 2025. Revoke at
   myaccount.google.com → App passwords; archive the repo (dead prototype).
3. **Blux export archive + block census** (high, S) — Blux is a one-man
   platform with an outage history; the block/sub-block JSON exports are
   irreplaceable raw material. Have Tim/Erik one-click-export all 10 sites now,
   archive to a private repo/bucket, add wget-mirror crawls as fallback, and
   run a census script over the JSONs (block types × sites, media inventory,
   how identical the 6 Worthe properties really are). The census scopes the
   whole conversion track. No engineering dependency on the current rollout.
4. **GA/Search role-account re-grant** (medium, S) — 4th consecutive morning
   brief: all fleet analytics impersonate tucker@ (single-subject SPOF).
   Re-grant GA4/Search Console to reports@reddoorla.com before the fleet grows.
5. **Hedloc pre-launch conformance + Airtable rows** (medium, S) — hedloc is on
   CI shim v1.0.0 (fleet: v1.2.0), Node 22 (fleet: 24), legacy `lucide-svelte`,
   no Turnstile; the newest site is the most divergent — drift happens at
   creation time. Also: Hedloc/Alamo Airtable rows are nearly empty and Alamo
   has NO `point of contact` (blocks its Launch email).

## NEXT — before/with the new sites (hedloc launch, Roalson start)

6. **New-site bootstrap automation** (high, M) — README's manual steps (Prismic
   repo, env vars, RENOVATE_TOKEN, CI `netlify-site` input, Airtable row, form
   slug registration) are where hedloc's drift came from. A
   `reddoor-maint new-site <slug>` (or ensure-row + checklist command) making
   the golden path the easy path; includes the "ensure Airtable Websites row"
   helper the conversion track also needs.
7. **Roalson listing/map slices as reusable starter patterns** (high, M) —
   Roalson (awarded, 107–206h) needs property listings/filter/geocoded map;
   the starter has one slice (RichText) and no data-listing patterns anywhere
   in the fleet. Build them as starter-grade reusable slices (M7.3 seed) — the
   6 Worthe conversions are the same commercial-real-estate domain and will
   reuse them.
8. **Airtable schema-check command** (medium, S) — today's verification found:
   a load-bearing misspelled column (`maintenence freq`), code that silently
   degrades on column renames (websites.ts:226 comment admits it), and a
   recipient-override footgun. A `reddoor-maint doctor`-style check (expected
   columns exist; lint operator addresses in client-recipient fields; flag
   stale anchors) turns silent data drift into a red cockpit tile.
9. **Maintenance-version propagation** (medium, S–M) — fleet sits at ^0.65.0
   while starter is ^0.67.0; maintenance is (rightly) on Renovate's
   no-automerge list, so bumps happen as ad-hoc sweeps. A `bump-maintenance
--fleet` recipe (per-repo PRs, CI-gated) makes propagation one command.

## THEN — the scale keystone

10. **M7.4 fleet conformance suite** (high, M–L) — the roadmap's named keystone,
    unstarted. The recon supplies its initial checklist: CI shim version + node
    input, renovate preset ref, maintenance version, Vite/TS majors
    (gallerysonder Vite 7; espada/vineyard Vite 6), Tailwind pipeline
    (PostCSS stragglers), security headers in netlify.toml (erp/revogen/espada/
    vineyard/alamo missing), forms on central ingest (caltex disconnected),
    Turnstile presence, package renamed from starter sentinel, `.nvmrc`,
    `tucksravin` origin URLs. Fits the existing audit registry → Airtable →
    cockpit pipeline as a 9th audit type.
11. **Branch-protection hardening** (low, S) — enforce_admins is off fleet-wide;
    the agent contract bans `--admin` merges but the gate should be structural.

## LATER — the Blux conversion track (after the current system is proven)

12. **Blux JSON parser + block→slice mapper** (high, M) — typed parser for the
    export JSON (zod per block type), mapper registry (block → Prismic slice,
    `htmlAsRichText` fallback), per-site coverage report (typed vs fallback %).
    Shared module, built against the archived exports; scoped by the census (#3).
13. **Worthe batch strategy** (high, M decision now = S) — one shared
    property-site content model + slice library; pilot ONE property end-to-end,
    then batch the remaining 5. Coordinate with Roalson (#7) so CRE slices are
    built once. Same client contacts across all 6 (MatthewB@/StephanieF@worthe.com).
14. **Redirects/SEO pipeline + DNS cutover runbook** (high, M; runbook S now) —
    URL-inventory crawl → old→new route map → emitted `_redirects`, fail on
    unmapped 200s; runbook: TTL lowering, DNS switch, SSL, Search Console
    change-of-address, post-cutover 404 sweep via existing domain/browser
    audits. Runbook also serves hedloc/Roalson launches.
15. **Conversion→maintenance handoff chain** (medium, S) — ensure-Airtable-row
    (with recipients) → `onboard`/`self-updating` → `launch <site>`; documented
    as the mandatory day-one chain so converted sites are audited + emailed from
    day one.
16. **Commercial preconditions** (medium, S, decisions not code) — disposition
    for the 4 non-contract Blux sites (strategyadvantage, compositionhospitality,
    xcoadvantage, tosa1): convert-with-contract / one-time paid / sunset —
    conversion is the natural upsell moment; nothing in the system tracks
    prospect/quote state today. Plus Prismic write-token strategy: rehearse all
    imports on ONE shared paid staging repo; buy production plans only at cutover.
17. **Staging parity + sign-off flow** (medium, M) — converted site on a Netlify
    subdomain (the alamo launch-period pattern), parity report of old/new
    screenshot pairs over the URL inventory, recorded client acceptance as the
    cutover gate.

## Client-lifecycle extras (opportunistic)

- **Post-announcement reply/feedback capture** (medium) — replies land at
  info@reddoorla.com with no path into Airtable/cockpit; even a "Client
  feedback" field + cockpit surface closes the loop.
- **GA4/Search coverage** (medium) — 8 of 10 maintenance sites have no GA4
  property / Search Console configured; reports render without analytics
  (Sonder precedent). Wire per-site after the role-account re-grant (#4).
