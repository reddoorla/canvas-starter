# CLAUDE.md

`canvas-starter` is a public prototype of a 2D "navigating a canvas"
interaction: full-viewport slides on a grid, where one gesture (arrow keys,
WASD, wheel, swipe) moves exactly one cell toward a filled neighbour and the
whole board glides. It was scaffolded from `reddoor-starter`, so most of `src/`
is inherited starter surface the canvas route never touches — the prototype
itself is `src/lib/canvas/nav.ts` (pure, unit-tested navigation logic),
`src/lib/canvas/presets.ts` (the four layouts) and
`src/lib/components/canvas/` (engine, Slide, NavArrows, Minimap,
LayoutSwitcher), mounted at `/` by
`src/routes/[[preview=preview]]/+page.svelte`.

Commands: `pnpm vite:dev`, `pnpm lint`, `pnpm check`, `pnpm test:unit`
(vitest), `pnpm test:smoke` (Playwright), `pnpm build`. There is **no
`pnpm verify`** here — unlike the site repos, this one has no combined gate;
CI is the shared reusable workflow in `reddoorla/.github`.

Two things that are deliberate and look like neglect:

- **`slicemachine.config.json` keeps the `your-prismic-repo-name` sentinel.**
  Prismic is an inert stub so this can be promoted to a template later; the
  production build needs no Prismic repo, and pointing it at a real one is a
  decision, not a cleanup.
- **This repo has no `.prettierrc`**, so the `--plugin prettier-plugin-svelte`
  flag in the `lint` and `format` scripts is load-bearing. Drop it and
  `prettier --check .` silently skips every `.svelte` file. (The site repos
  moved this into a config file and removed the flag — do not copy that here
  without adding the config.)

## The work journal

**Every working session appends a dated entry to `docs/workJournal.md`** — what
was done and **why**, newest at the bottom, never corrected in place. Write it
as the last act of the session, not the first act of the next one.

The journal is the history of executing the build. Code says what the system
does now; the journal says what it used to do, what it cost to change, and
which beliefs turned out to be wrong. Nearly everything expensive to rediscover
lives there and nowhere else.

An entry is headed with the date, a short title, and where it landed:

```markdown
## 2026-09-04 — Both runway stages render their final frame without JS (#51, `ce46ae0`)
```

Then prose — not a bullet list of file names, which the diff already tells you.
What to put in, in rough order of value:

- **Why, over what.** The reason a thing was done survives; the diff does not
  need restating.
- **Measured numbers, exactly.** "The comp's open mask is 2696×2352 on an 860px
  band — 2.735× the band's height, so a 390×664 phone needs ~534%" is worth
  keeping. "Fixed the hero on mobile" is not.
- **Defects, named.** What broke, what it looked like, and what made it
  invisible until it wasn't.
- **What was tried and abandoned**, and what it would take to revive it. A dead
  end nobody wrote down gets walked twice.
- **Beliefs corrected on contact.** The design assumption that turned out false
  is usually the most valuable line in the entry.
- **Honest accounting.** If a win came from somewhere other than the change
  that claimed it, say so — that is exactly what someone will otherwise
  over-invest in next.

**History is never edited to be right.** An entry that stops being true is not
rewritten; a later entry corrects it, and says which one it corrects. The
journal is a record of what was believed at the time, and that record is most
useful precisely where it was wrong. Fixing the past in place destroys the only
evidence of how the mistake was made.

If a session produced nothing worth an entry, that is itself worth one line.
