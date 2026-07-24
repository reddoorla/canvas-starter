# canvas-starter

A test site exploring a 2D "navigating a canvas" interaction: full-viewport
slides arranged on a grid, navigated by directional snap (up/down/left/right)
with a smooth gliding transition. Inspired by bodeyco.com, extended to two axes.

## Layouts

Switch live with the top-left control. Defined in `src/lib/canvas/presets.ts`:

- `t4` — 3 across, 1 below center (4 slides)
- `plus5` — a plus/cross (5 slides)
- `grid6` — 2×3 (6 slides)
- `grid9` — 3×3 (9 slides)

## Controls

- **Keyboard:** arrow keys or WASD
- **Trackpad/wheel:** swipe/scroll in a direction
- **Touch:** swipe in a direction

One gesture moves exactly one cell, and only toward a filled neighbor.
`prefers-reduced-motion` disables the glide.

## Stack

Built on the reddoor-starter (SvelteKit + Svelte 5 + Vite + Tailwind 4 +
adapter-netlify). Prismic is present but inert (`isPlaceholderRepo`) so this
can be promoted to a template later.

## Develop

```bash
pnpm install
pnpm vite:dev      # dev server
pnpm test:unit     # nav logic + Canvas component tests
pnpm build         # production build (no Prismic repo needed)
```

## Architecture

- `src/lib/canvas/nav.ts` — pure, unit-tested navigation logic
- `src/lib/canvas/presets.ts` — the four layouts
- `src/lib/components/canvas/` — Canvas engine, Slide, NavArrows, Minimap, LayoutSwitcher
- Canvas mounts at `/` (`src/routes/[[preview=preview]]/+page.svelte`)
