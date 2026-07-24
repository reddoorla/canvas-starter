# Reddoor LA — fleet & stack context brief

Compiled 2026-07-02 from a 9-agent recon across all reddoorla repos, planning
docs, session archives, Gmail, and Airtable references. Local-only (untracked
via `.git/info/exclude`) — operator context, must not ship with the template.
Sibling docs: [AUTONOMY.md](AUTONOMY.md) (how the agent operates),
[docs/autonomy-journal.md](docs/autonomy-journal.md).

## 1. The business model

Reddoor LA is a solo-operated (Tucker; team: nicole@, tim@, erik@ + Erik owns
some client accounts) web studio building **SvelteKit + Prismic + Netlify**
client sites from this template (`reddoor-starter`), kept healthy at scale by a
central maintenance system (`@reddoorla/maintenance`). Strategic goal (locked
2026-06-02, fleet-scale roadmap): **~200 self-maintaining sites** where the
central tool is orchestrator + observability, and the operator's steady-state
loop is: daily cockpit glance → per-report "yes, send" → hands-on testing →
launch onboarding. Revenue motion: RFP analysis (`rfp-analyze` skill +
`reddoor-rfp-analyses` repo) → build from starter → launch email → recurring
maintenance/testing reports (monthly/quarterly) as the ongoing relationship.

## 2. Canonical stack (starter HEAD 2026-07-02)

Svelte ^5.55.10 · SvelteKit ^2.61.1 · Vite ^8.0.14 · Tailwind ^4.3.0 (via
`@tailwindcss/vite`) · TypeScript ^6.0.3 · `@sveltejs/adapter-netlify` ^6.0.4
(`edge:false, split:false`) · Prismic (`@prismicio/client` ^7, `/svelte` ^2,
Slice Machine ^2) · `@reddoorla/maintenance` ^0.67.0 · `@lucide/svelte` ·
`@zerodevx/svelte-img`+sharp · pnpm@11.8.0 · Node 24 (CI + Netlify). Features:
CSP via `kit.csp` (Vimeo/Prismic/Turnstile allowlisted, `/api/csp-report`),
security headers in netlify.toml + hooks.server.ts, contact form →
`createIngestAction` from `@reddoorla/maintenance/forms` → central ingest
(honeypot + timing + optional Turnstile, PR #31), a11y fixtures routes
(`/dev/a11y-fixtures`, `/dev/animate-in`) consumed by audits, WCAG 2.2 AA
targets, placeholder-Prismic-repo build tolerance, one slice (RichText) + one
custom type (page). New-site manual steps: README:47-66 + .env.example
(Prismic repo name, FORMS_INGEST_URL/TOKEN, optional PUBLIC_TURNSTILE_SITE_KEY,
RENOVATE_TOKEN secret, `netlify-site` CI input, CSP-report sink before launch).

## 3. Org map (github.com/reddoorla — free plan, 1 member `tucksravin`)

| Repo                | Role                                                                                                                                                                               |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| reddoor-starter     | This template. Netlify: reddoor-wireframer                                                                                                                                         |
| reddoor-maintenance | The central system (npm `@reddoorla/maintenance`, v0.66.0 released; HEAD has unreleased forms-spam work). Deployed cockpit: reddoor-maintenance.netlify.app                        |
| .github             | M7.1 "fix-once home": reusable CI workflow (v1.2.0 @ 45ded88) + org Renovate preset. 12 repos on v1.2.0; hedloc lags on v1.0.0                                                     |
| reddoor-website     | Studio's own site (reddoorla.com), very active (Turnstile #80, portfolio rebuild #78)                                                                                              |
| Client sites        | gallerysonder, caltex-landing, alamo-anatomy, erp-industrial, la-homelessness-initiative, data-dynamiq, hedloc, revogen, espada, vineyard-custom-homes, medical-solutions-of-texas |
| Private             | reddoor-rfp-analyses (RFP pipeline), reddoor-md-pdf, reddoor-test (dormant 2024 seed experiment)                                                                                   |

Org secrets: RENOVATE_TOKEN (all), AIRTABLE_BASE_ID/PAT + RESEND_API_KEY
(maintenance only). Branch protection pattern: `ci / ci` required strict,
enforce_admins **off** everywhere, no human review required (solo operator).

## 4. The maintenance system (@reddoorla/maintenance)

CLI `reddoor-maint` (creds auto-load from `~/.config/reddoor-maint/credentials.env`):
`audit` (8 audits: deps/lighthouse/a11y/security/lint/domain/browser/netlify-deploy;
`--fleet airtable`, `--write-airtable`), `init`/`onboard`/`convert-to-pnpm`/
`sync-configs`/`svelte-codemods`/`upgrade svelte-4-to-5`/`bump-deps`/
`self-updating` (bootstraps per-repo CI+Renovate, drift-detects),
`launch <site>`, `announce [site]`, `report` (`--due`/`--preview`/`--send-ready`/
`--digest`), `selftest email` (`--all --type --to --dry-run`, zero side effects),
`github-signals`, `renovate-dispatch --fleet`, `db migrate`.

Email pipeline: 4 MJML report types (Maintenance/Testing/**Announcement**/Launch)
with Lighthouse + GA4 users + Search Console position + checklist auto-tick;
recipients from Airtable `Report recipients (To)/(CC)`; Resend from
`reports@reddoorla.com`, CC info@reddoorla.com always, idempotent sends, Svix
delivery webhook. Flow: draft (cron `report --due` or `announce`) → operator
approves (dashboard one-click or Airtable) → `report --send-ready` sends.

Data: Airtable base `appHG8nLOzULzXOER` (Websites/Reports/Digest State — human
back-office) + libSQL/Turso (submissions, spam counters, fleet_events).
Cockpit (Basic-auth Netlify functions): four-band verdict, "Needs you" feed,
per-site dashboards, submissions + spam lanes, one-click approve, trigger-renovate,
refresh-fleet. Nightly automation: fleet-security 06:00 UTC → renovate-dispatch;
fleet-lighthouse 08:00; daily-reports 09:23 (due→send-ready→digest);
release-health 14:30.

## 5. Fleet status (remote main, 2026-07-02)

All 11 client repos + starter: pnpm, adapter-netlify ^6.0.4, thin-shim CI →
reusable v1.2.0 (hedloc: v1.0.0), self-hosted Renovate Mondays extending the
org preset, maintenance ^0.65.0 (starter ^0.67.0 — bump wave not yet
propagated). Zero open PRs fleet-wide. Divergences that matter:

| Site                         | Lags / notes                                                                                                               |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| gallerysonder                | Vite **7**, PostCSS tailwind pipeline, package name never renamed, 15 stale local branches. First (only) announced client  |
| espada                       | Vite **6**, ts 5.5, kit ^2.5.27, still FontAwesome                                                                         |
| vineyard-custom-homes        | Vite **6**, tw ^4.0.14; local clone worst (wrong branch, dirty, 12+ behind)                                                |
| erp-industrial               | `@prismicio/svelte` **1.x**, slice-machine-ui 1.26, PostCSS pipeline, sass, no security headers in netlify.toml            |
| revogen                      | Vite 7; has extra repo-local Lighthouse CI gate (PR #28)                                                                   |
| alamo-anatomy                | Only site with vitest; status `launch period` (netlify-only URL, Erik's account) — gets **Launch** email, not Announcement |
| la-homelessness-initiative   | **No Prismic** (plain SvelteKit), SendGrid+reCAPTCHA contact (unique), Node 22                                             |
| hedloc                       | Pre-launch, active dev; legacy `lucide-svelte` pkg, Node 22, CI shim v1.0.0, no Renovate dashboard issue yet               |
| medical-solutions-of-texas   | Closest to starter; was the Svelte 4→5 pilot                                                                               |
| data-dynamiq, caltex-landing | On-stack; caltex has no central-ingest forms (removed Netlify Forms, nothing replaced it)                                  |

Local clones: 8 of 11 stale vs origin/main (audits from local package.json give
wrong answers — fetch first). 4 clones still have `tucksravin` origin URLs.

## 6. Roadmap & priorities

Fleet-scale roadmap (2026-06-02): M1 self-updating ✅ · M2 audits-at-scale
(shipped via nightly workflows) · M3 scheduled recurrence + approve-only loop ✅
· M4 cockpit ✅ · M5 alerting ✅ · M6 launch+copy flow ✅ (all by 06-12) ·
**M7 shared plumbing — partial**: M7.1 reusable CI ✅; M7.2 `createSvelteConfig`
shipped, starter adoption pending; M7.3 shared docs/plumbing components — not
started; **M7.4 fleet conformance suite — "the keystone", not started, needs a
deep-research pass first**; M7.5 mostly realized; M7.6 recipe deprecation — not
started. **1.0 = M1–M6 + Tucker consistently using the tool** — not yet claimed
(v0.66.0). Active work: forms spam defense (Turnstile + heuristic classifier;
central plan 2026-07-01, 11 tasks; starter leg merged as #31). Morning-report
top-of-stack (07-01): `toFrequency` guard fix; **GA/Search single-subject SPOF
(4th consecutive brief — all fleet analytics impersonate tucker@; re-grant to
role account before ~25 sites)**; email footer color unification; LOW sweep.

## 7. Announcement rollout state (as of 2026-07-02)

Machinery complete and battle-tested. Selftest pattern: internal review send per
site → real announcement. 2026-06-30: full internal selftest blast (10 sites ×
announcement to nicole/tim/erik/tucker@reddoorla.com). **Sonder's real
announcement sent 2026-06-30** (To info@gallerysonder.com, Resend
`bd74e629-…`), anchors set 06-30, next maintenance ~08-30, next test ~09-30.
Same-day fallout (Airtable automation double-count) fixed by #347 / v0.66.0 and
manual deletion of the two Airtable formula fields. **Remaining to announce
(9)**: MSOT, Data Dynamiq, ERP Industrials, Espada, Vineyard, Revogen, CalTex,
Youth Mental Health (lahomelessnessawareness.org), Reddoor (self). Alamo is on
the Launch path instead. Open feedback: Erik (07-01) — Sonder hero image
(rotating featured artists) will date; wants timeless hero imagery. Recipients:
send path uses `Report recipients (To)` **with fallback to `point of contact`**
(orchestrate.ts:139-142) — verified 2026-07-02: all 9 remaining sites have a
client point of contact; watch-outs are ERP's To-override set to
tucker@reddoorla.com (would divert the client send) and MSOT's contact being
albert@revogenbiologics.com (same as Revogen's — verify before send). Airtable
gotcha: the frequency column is literally misspelled `maintenence freq`, and
websites.ts degrades silently on column renames.

## 8. Blux (legacy platform → conversion pipeline)

**BLUX, Inc. (blux.com)** — hosted block-based website builder/CMS used for the
pre-SvelteKit era; effectively one man (Dan Williams, dan@blux.com); repeated
SSL/publish outages 2023-2025 = the migration motive. **10 sites confirmed
still on Blux (live-verified 2026-07-02):** six Worthe Real Estate properties
(thetowerburbank, mediastudiosburbank, thepointeburbank, thepinnacleburbank,
theburbankportfolio, tbpfit) — Worthe contacts MatthewB@/StephanieF@worthe.com —
plus strategyadvantage.com, compositionhospitality.com, xcoadvantage.com,
tosa1.org (last four: no maintenance contract). Already off: reddoorla.com,
dbmsa.org, TIP Connect, bluedoorcares, embrey, therapysync. **Conversion raw
material:** Blux offers a one-click full-site export — media + generated HTML +
**site-data JSON (block/sub-block content model)**; UI-triggered, needs backend
login (Tim/Erik hold collaborator access); proven in practice (TIP Connect).
Fallback: all 10 are public static HTML, trivially crawlable. Existing hooks:
starter's `docs/migration.md` + `scripts/import/migrate.example.ts` (Prismic
Migration API, `htmlAsRichText`, 1 doc/sec, needs paid-plan write token).
Operator's stated philosophy: "we get the data they want us to read, then
publish it at launch with the new design."

## 9. New-site pipeline

- **hedloc** — in active build (contact form on fleet ingest 07-01); pre-launch.
- **Roalson Interests** — **awarded**; commercial real-estate rebuild of
  roalson.com (~23 geocoded property listings, filter/map), est. 107–146–206 h
  (analysis 2026-06-04). No repo yet.
- RFP outcomes uncertain: baxter-st-park, discover-classical, dulverton-trust,
  ohio-justice-foundation (2026-05), donate-life-america (scaffold only).

## 10. Risk register (standing)

1. **Committed Gmail app password** in `tucksravin/reddoor-mailer`
   `src/index.ts:18` (dead 2025 prototype, but live credential for
   contact@tuckerlemos.com) — rotate/revoke + archive repo. RED/human.
2. **GA/Search single-subject SPOF** — 4 briefs running.
3. **enforce_admins off** fleet-wide — CI gate advisory for admin merges.
4. Autonomy journal in reddoor-maintenance not appended since 2026-06-12 (#203)
   despite PRs to ≥#348 — history lives in morning reports instead.
5. Starter doc drift: security.md claims Dependabot + pnpm-audit gate (neither
   exists; Renovate replaced them); accessibility.md CI claim imprecise.
6. Local clone staleness (8/11) + 4 `tucksravin` origin URLs.
7. caltex contact form disconnected from central ingest (Netlify Forms removed,
   nothing replaced it).
8. reddoor-maintenance not using reusable CI (bespoke, deliberate) — fine, noted.
