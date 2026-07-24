# Canvas Navigation — Design Spec

**Date:** 2026-07-24
**Status:** Approved (design), pending implementation plan
**Repo:** `reddoorla/canvas-nav` (to be created) — Netlify-deployed for sharing

## 1. Goal

A small test site that demonstrates a **spatial "navigating a canvas" interaction**, inspired by
bodeyco.com but in **2D (up/down/left/right)** rather than a single scroll axis. The canvas is a grid
of full-viewport "slides." Moving in a direction glides the whole canvas to the neighboring slide.

The site must support **four layouts** by config only:

```
t4              plus5           grid6           grid9
[X][X][X]       [ ][X][ ]       [X][X][X]       [X][X][X]
[ ][X][ ]       [X][X][X]       [X][X][X]       [X][X][X]
                [ ][X][ ]                       [X][X][X]
4 slides        5 slides        6 slides        9 slides
```

`X` = a slide, blank = empty cell (unreachable, no content).

## 2. Approved decisions

| Decision | Choice |
|---|---|
| Navigation model | **Directional snap** — wheel/trackpad, arrow keys (+ WASD), and swipe each move exactly one cell in a direction. Only filled neighbors are reachable. |
| Transition | **Smooth glide** — the entire canvas translates so you watch the current slide leave and the next arrive. |
| Layouts | **Flexible engine** — one grid config drives all four presets. |
| Content | **Hardcoded placeholders** — big number + background color per slide. Swappable for real content later. |
| Edges | **Hard edges, no wrap-around.** A move toward an empty/out-of-bounds cell is a no-op. |
| Discoverability | Keep **both** extras: faint on-screen directional arrows (lit only toward reachable neighbors) + a tiny minimap dot indicator. |

## 3. Technical approach — "one big translated board"

Chosen over native CSS 2D scroll-snap (fights sparse layouts; trackpads skip cells) and a two-slide
crossfade engine (loses the spatial feel).

- Render **every** slide absolutely positioned inside one board container sized `cols × rows` viewports.
- Track the current cell `{ row, col }`.
- Every move changes `row`/`col`; the board applies
  `transform: translate3d(calc(-col * 100vw), calc(-row * 100vh), 0)` with a CSS transition.
- GPU-accelerated, trivially simple, and sparse shapes are free — a cell is either filled or empty and
  you can only move to a filled neighbor.
- At 4–9 slides, mounting all slides at once is a non-issue.

## 4. Stack & base

Built on the **reddoor-starter** stack (so Netlify deploy, Tailwind 4, Vitest, and swipe gestures come
for free):

- SvelteKit 2.6x, **Svelte 5 (runes)**, Vite 8, Tailwind 4, pnpm, Node ≥20
- `@sveltejs/adapter-netlify` (already configured via `netlify.toml`)
- `svelte-gestures` (already a dependency) for touch/swipe
- Vitest 4 for unit tests (co-located `*.test.ts`), Playwright for a smoke test

**Prismic is not used.** The canvas mounts at `/` and the starter's Prismic-driven routes/content
fetching are removed or bypassed so the site runs with no Prismic repo. (Exact strip-down is an
implementation-plan detail.)

## 5. Components & responsibilities

Everything lives under `src/lib/components/canvas/` with the route at `src/routes/+page.svelte`.

### `nav.js` (pure logic — the testable heart)
- `parseLayout(preset)` → `{ rows, cols, filled: Set<"r,c">, slides: [{ r, c, label, color }] }`
- `nextCell(current, direction, filled)` → target `{ row, col }` or `null`
  - `direction ∈ { 'up','down','left','right' }`
  - Returns the neighbor only if it is within bounds **and** in `filled`; otherwise `null`.
- `entryCell(layout)` → the cell the canvas opens on (and resets to on layout switch): the filled cell
  nearest the grid's geometric center (Euclidean distance), ties broken by reading order.
  (plus5/grid9 → center `{1,1}`; t4 → top-center `{0,1}`, its most-connected hub; grid6 → `{0,1}`.)
- No DOM, no Svelte — pure functions, exhaustively unit-tested.

### `Canvas.svelte` (engine)
- **Props:** `layout` (one of the four presets).
- **State (runes):** `current = $state({ row, col })`, `isAnimating = $state(false)`.
- Renders the translated board of `Slide` components; computes the transform from `current`.
- Wires up input handlers (§6); on a valid `nextCell`, updates `current`, sets `isAnimating`, and clears
  it on `transitionend` (or a timeout fallback).
- Renders `NavArrows` and `Minimap`, passing the set of currently-reachable directions and position.

### `Slide.svelte`
- One cell. **Props:** `slide` (`{ label, color }`), plus grid position.
- Renders placeholder content (large label + background color) via a `children` snippet so real content
  can be dropped in later without touching the engine.

### `NavArrows.svelte`
- Fixed-position up/down/left/right affordances. **Props:** `reachable` (which directions have a filled
  neighbor). Dims/hides arrows with no target. Clicking an arrow triggers a move.

### `Minimap.svelte`
- Tiny grid of dots reflecting the layout; the current cell is highlighted. Empty cells shown faded or
  omitted. Read-only indicator.

### `LayoutSwitcher.svelte`
- Small fixed-corner control to switch between `t4 / plus5 / grid6 / grid9` live (the point of a test
  site — comparing layouts). Resets `current` to that layout's entry cell on switch.

## 6. Input handling (one move per gesture)

All inputs resolve to a single `direction`, then defer to `nextCell`. While `isAnimating`, all input is
ignored (enforces exactly one cell per gesture).

- **Wheel/trackpad:** `preventDefault`; choose dominant axis (`|deltaX|` vs `|deltaY|`); require a small
  threshold to fire; lock until transition end + a short cooldown so one swipe = one move.
- **Keyboard:** Arrow keys and WASD. Canvas is focusable; keydown handled at the container.
- **Touch:** swipe via `svelte-gestures`; dominant-axis delta → direction.
- Move toward an empty/out-of-bounds neighbor = no-op (optional subtle "bounce" for feedback).

## 7. Transition & accessibility

- Board transition: `transform ~500–600ms` with an ease curve.
- `prefers-reduced-motion: reduce` → instant snap (no translate animation), input still gated by a short
  cooldown.
- Focusable canvas; slides carry accessible labels; arrow-key navigation works without a pointer.

## 8. Deployment

- Local: `~/Documents/GitHub/canvas-nav`.
- GitHub: create **`reddoorla/canvas-nav`** (visibility to confirm — see Open Questions), push `main`.
- Netlify: connect the repo (adapter-netlify + `netlify.toml` already present) for a shareable URL.

## 9. Testing

- **TDD `nav.js`** with Vitest: `nextCell` across all four presets — arms, corners, out-of-bounds,
  empty-neighbor no-ops, and `parseLayout` correctness.
- One Playwright **smoke test**: page loads, a keypress moves the board (transform changes), reduced-motion
  path doesn't error.
- No heavy E2E — this is a prototype.

## 10. Out of scope (YAGNI)

- Prismic / CMS content, real copy, imagery.
- Deep-linking to a specific slide, browser-history per slide.
- Diagonal moves, gap-skipping across empty cells, wrap-around.
- Zoom-out "whole canvas" overview mode (possible future add; not now).

## 11. Open questions for implementation

1. **GitHub repo visibility** — public or private? (Netlify can deploy either.)
2. **Scaffold path** — fork/copy `reddoor-starter` and strip Prismic, vs. a minimal fresh SvelteKit app
   matching the same stack. Leaning: copy the starter, gut Prismic, mount canvas at `/`.
3. Repo name `canvas-nav` OK, or prefer something else?
