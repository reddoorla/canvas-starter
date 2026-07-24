# Blux export — ask for Tim/Erik (draft, 2026-07-02)

Local-only operator note (git-excluded). Context: [FLEET.md](../FLEET.md) §8,
[GAPS.md](../GAPS.md) #3. Blux is a one-man platform with an SSL/outage history;
the structured exports are the raw material for every future conversion and are
unrecoverable if Blux disappears. This costs one login session and hedges that
risk — it does NOT commit us to converting anything yet.

## The message (paste/adapt for Tim + Erik)

> Could you pull the full site export for each of our Blux sites while we still
> have clean access? Blux backend → each site → the one-click "download your
> entire site" export (media + generated HTML + site-data JSON — same thing we
> did for TIP Connect). Sites (whoever has collaborator access on each):
>
> 1. thetowerburbank.com
> 2. mediastudiosburbank.com
> 3. thepointeburbank.com
> 4. thepinnacleburbank.com
> 5. theburbankportfolio.com
> 6. tbpfit.com
> 7. strategyadvantage.com
> 8. compositionhospitality.com
> 9. xcoadvantage.com
> 10. tosa1.org
>
> Drop the zips somewhere shared (or a private reddoorla repo — suggest
> `reddoorla/blux-exports`, one folder per site, name as exported). No rush on
> any given day, but sooner is safer — this is our only structured copy of that
> content if Blux ever goes dark.

Note from the 2024 "Sites that I know of :)" thread: collaborator access is
split — "Erik you will need [to] add any Blux that I'm not a collaborator on"
(Tim). So the list may need splitting between them.

## After the bundles exist

Run the census script over the site-data JSONs:

```bash
node blux-migration/census.mjs <dir-with-export-folders>
```

It reports: block types used × site, counts, media inventory sizes, and a
similarity matrix across the 6 Worthe sites — the requirements doc for the
block→slice mapper (GAPS.md #12) and the batch-vs-bespoke decision (#13).

Secondary fallback (can run any time, no login needed): wget-mirror each live
site. Worth doing once regardless:

```bash
for d in thetowerburbank.com mediastudiosburbank.com thepointeburbank.com \
         thepinnacleburbank.com theburbankportfolio.com tbpfit.com \
         strategyadvantage.com compositionhospitality.com xcoadvantage.com tosa1.org; do
  wget --mirror --page-requisites --no-parent --wait=1 -P blux-crawls "https://$d"
done
```
