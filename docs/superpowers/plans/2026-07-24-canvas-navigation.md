# Canvas Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a shareable test site where the user navigates a 2D grid of full-viewport "slides" by directional snap (up/down/left/right) with a smooth gliding transition, supporting four layouts (t4/plus5/grid6/grid9) from config.

**Architecture:** One big CSS-grid "board" sized `cols × rows` viewports holds every slide; the board is `transform: translate3d(...)`-ed to the current cell with a CSS transition. All navigation logic is a pure, unit-tested TypeScript module (`nav.ts`); Svelte 5 components render the board and wire up wheel/keyboard/touch input, each move gated so one gesture = one cell.

**Tech Stack:** Copied from `reddoor-starter` — SvelteKit 2.6x, Svelte 5 (runes), Vite 8, Tailwind 4, pnpm, Vitest 4, `@testing-library/svelte`, `@sveltejs/adapter-netlify`. Prismic is present but inert (`isPlaceholderRepo`).

**Working directory for every task:** `~/Documents/GitHub/canvas-starter`

**Spec:** `docs/superpowers/specs/2026-07-24-canvas-navigation-design.md`

---

## File Structure

Created by this plan (all under `~/Documents/GitHub/canvas-starter`):

- `src/lib/canvas/nav.ts` — pure logic: types, `parseLayout`, `nextCell`, `entryCell`, `reachableDirections`, `axisDirection`, `cellKey`.
- `src/lib/canvas/nav.test.ts` — Vitest unit tests for the above.
- `src/lib/canvas/presets.ts` — the four layout presets.
- `src/lib/components/canvas/Slide.svelte` — one full-viewport cell.
- `src/lib/components/canvas/Canvas.svelte` — the engine (board + input + transition).
- `src/lib/components/canvas/Canvas.test.ts` — component test for keyboard navigation + animation gating.
- `src/lib/components/canvas/NavArrows.svelte` — directional affordances lit toward reachable neighbors.
- `src/lib/components/canvas/Minimap.svelte` — position indicator dots.
- `src/lib/components/canvas/LayoutSwitcher.svelte` — live preset switcher.

Modified:

- `package.json` — rename `name`.
- `src/routes/[[preview=preview]]/+page.svelte` — replace Prismic homepage with the canvas mount.
- Delete `src/routes/[[preview=preview]]/+page.server.ts` — canvas needs no server load. (Prismic pattern is preserved in the `[uid]` route and `$lib/prismicio.ts`.)

---

## Task 1: Scaffold canvas-starter from reddoor-starter (green baseline)

**Files:**

- Copy tree from `~/Documents/GitHub/reddoor-starter` into `~/Documents/GitHub/canvas-starter`
- Modify: `package.json` (name field)

- [ ] **Step 1: Copy the starter tree (excluding git/build/deps), preserving our docs/**

Run:

```bash
cd ~/Documents/GitHub/canvas-starter
rsync -a \
  --exclude='.git' --exclude='node_modules' --exclude='.svelte-kit' \
  --exclude='build' --exclude='.netlify' \
  ~/Documents/GitHub/reddoor-starter/ ./
```

Expected: files appear (src/, package.json, svelte.config.js, netlify.toml, etc.); existing `docs/` is untouched.

- [ ] **Step 2: Rename the package**

Edit `package.json`, change the `"name"` field:

```json
"name": "canvas-starter",
```

- [ ] **Step 3: Install dependencies**

Run: `pnpm install`
Expected: install completes with no errors (pnpm 11.x, Node ≥20 — use `nvm use` if needed; `.nvmrc` pins 24.18.0).

- [ ] **Step 4: Verify the starter's existing unit tests pass on the copy**

Run: `pnpm test:unit`
Expected: PASS (existing `seo.test.ts`, `transitions.test.ts`, `health/server.test.ts`, `robots.txt/server.test.ts` all green). This confirms the toolchain copied correctly.

- [ ] **Step 5: Commit the scaffold**

```bash
git add -A
git commit -m "chore: scaffold canvas-starter from reddoor-starter

Copy the starter tree (Svelte 5 / Vite 8 / Tailwind 4 / Vitest /
adapter-netlify). Prismic left inert via isPlaceholderRepo.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Layout presets + pure navigation logic (TDD)

**Files:**

- Create: `src/lib/canvas/presets.ts`
- Create: `src/lib/canvas/nav.ts`
- Test: `src/lib/canvas/nav.test.ts`

- [ ] **Step 1: Write the presets module**

Create `src/lib/canvas/presets.ts`:

```ts
import type { Layout } from "./nav";

export type PresetName = "t4" | "plus5" | "grid6" | "grid9";

// cells are row-major, 1 = a slide, 0 = an empty cell.
export const PRESETS: Record<PresetName, Layout> = {
  t4: { name: "t4", rows: 2, cols: 3, cells: [1, 1, 1, 0, 1, 0] },
  plus5: {
    name: "plus5",
    rows: 3,
    cols: 3,
    cells: [0, 1, 0, 1, 1, 1, 0, 1, 0],
  },
  grid6: { name: "grid6", rows: 2, cols: 3, cells: [1, 1, 1, 1, 1, 1] },
  grid9: {
    name: "grid9",
    rows: 3,
    cols: 3,
    cells: [1, 1, 1, 1, 1, 1, 1, 1, 1],
  },
};
```

- [ ] **Step 2: Write the failing tests for nav.ts**

Create `src/lib/canvas/nav.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import {
  parseLayout,
  nextCell,
  entryCell,
  reachableDirections,
  axisDirection,
  cellKey,
} from "./nav";
import { PRESETS } from "./presets";

const plus5 = parseLayout(PRESETS.plus5);
const t4 = parseLayout(PRESETS.t4);
const grid6 = parseLayout(PRESETS.grid6);
const grid9 = parseLayout(PRESETS.grid9);

describe("cellKey", () => {
  it("formats row,col", () => {
    expect(cellKey(1, 2)).toBe("1,2");
  });
});

describe("parseLayout", () => {
  it("counts filled cells as slides", () => {
    expect(plus5.slides).toHaveLength(5);
    expect(t4.slides).toHaveLength(4);
    expect(grid6.slides).toHaveLength(6);
    expect(grid9.slides).toHaveLength(9);
  });

  it("records rows/cols and a filled set", () => {
    expect(plus5.rows).toBe(3);
    expect(plus5.cols).toBe(3);
    expect(plus5.filled.has(cellKey(1, 1))).toBe(true); // center filled
    expect(plus5.filled.has(cellKey(0, 0))).toBe(false); // corner empty
  });

  it("labels slides 1..n in reading order and assigns distinct colors", () => {
    expect(plus5.slides[0].label).toBe("1");
    expect(plus5.slides[4].label).toBe("5");
    const colors = new Set(plus5.slides.map((s) => s.color));
    expect(colors.size).toBe(5);
  });
});

describe("nextCell", () => {
  it("moves to a filled neighbor", () => {
    expect(nextCell({ row: 1, col: 1 }, "down", plus5)).toEqual({
      row: 2,
      col: 1,
    });
    expect(nextCell({ row: 1, col: 1 }, "left", plus5)).toEqual({
      row: 1,
      col: 0,
    });
  });

  it("returns null toward an empty neighbor", () => {
    // from the top arm of the plus, left/right/up are empty
    expect(nextCell({ row: 0, col: 1 }, "left", plus5)).toBeNull();
    expect(nextCell({ row: 0, col: 1 }, "up", plus5)).toBeNull();
  });

  it("returns null off the grid edge", () => {
    expect(nextCell({ row: 0, col: 0 }, "up", grid9)).toBeNull();
    expect(nextCell({ row: 0, col: 0 }, "left", grid9)).toBeNull();
  });
});

describe("reachableDirections", () => {
  it("gives all four at the plus center", () => {
    const dirs = reachableDirections({ row: 1, col: 1 }, plus5);
    expect([...dirs].sort()).toEqual(["down", "left", "right", "up"]);
  });

  it("gives only down from the plus top arm", () => {
    const dirs = reachableDirections({ row: 0, col: 1 }, plus5);
    expect([...dirs]).toEqual(["down"]);
  });
});

describe("entryCell", () => {
  it("opens plus5 and grid9 at the center", () => {
    expect(entryCell(plus5)).toEqual({ row: 1, col: 1 });
    expect(entryCell(grid9)).toEqual({ row: 1, col: 1 });
  });

  it("opens t4 at the top-center hub", () => {
    expect(entryCell(t4)).toEqual({ row: 0, col: 1 });
  });

  it("opens grid6 at the top-center of its nearest-to-center row", () => {
    expect(entryCell(grid6)).toEqual({ row: 0, col: 1 });
  });
});

describe("axisDirection", () => {
  it("ignores tiny movements below threshold", () => {
    expect(axisDirection(2, 3, 20)).toBeNull();
  });

  it("picks the dominant axis", () => {
    expect(axisDirection(0, 30, 20)).toBe("down");
    expect(axisDirection(0, -30, 20)).toBe("up");
    expect(axisDirection(30, 0, 20)).toBe("right");
    expect(axisDirection(-30, 0, 20)).toBe("left");
  });

  it("prefers vertical on a tie", () => {
    expect(axisDirection(30, 30, 20)).toBe("down");
  });
});
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `pnpm exec vitest run src/lib/canvas/nav.test.ts`
Expected: FAIL — `Cannot find module './nav'` (nav.ts not created yet).

- [ ] **Step 4: Implement nav.ts**

Create `src/lib/canvas/nav.ts`:

```ts
export type Direction = "up" | "down" | "left" | "right";

export interface Cell {
  row: number;
  col: number;
}

/** A layout config: row-major `cells`, 1 = a slide, 0 = empty. */
export interface Layout {
  name: string;
  rows: number;
  cols: number;
  cells: number[];
}

export interface Slide {
  row: number;
  col: number;
  label: string;
  color: string;
}

export interface ParsedLayout {
  name: string;
  rows: number;
  cols: number;
  filled: Set<string>;
  slides: Slide[];
}

export const cellKey = (row: number, col: number): string => `${row},${col}`;

/** Expand a Layout into a filled-cell set plus labelled, coloured slides. */
export function parseLayout(layout: Layout): ParsedLayout {
  const filled = new Set<string>();
  const slides: Slide[] = [];

  for (let row = 0; row < layout.rows; row++) {
    for (let col = 0; col < layout.cols; col++) {
      if (layout.cells[row * layout.cols + col] !== 1) continue;
      const index = slides.length;
      filled.add(cellKey(row, col));
      slides.push({
        row,
        col,
        label: String(index + 1),
        // Distinct hue per slide, derived from fill order.
        color: `hsl(${(index * 47) % 360} 70% 52%)`,
      });
    }
  }

  return {
    name: layout.name,
    rows: layout.rows,
    cols: layout.cols,
    filled,
    slides,
  };
}

const DELTA: Record<Direction, Cell> = {
  up: { row: -1, col: 0 },
  down: { row: 1, col: 0 },
  left: { row: 0, col: -1 },
  right: { row: 0, col: 1 },
};

/** The neighbour cell in `dir`, or null if it is empty / off the grid. */
export function nextCell(
  current: Cell,
  dir: Direction,
  parsed: ParsedLayout,
): Cell | null {
  const target = {
    row: current.row + DELTA[dir].row,
    col: current.col + DELTA[dir].col,
  };
  return parsed.filled.has(cellKey(target.row, target.col)) ? target : null;
}

/** Which of the four directions currently lead to a filled neighbour. */
export function reachableDirections(
  current: Cell,
  parsed: ParsedLayout,
): Set<Direction> {
  const out = new Set<Direction>();
  (Object.keys(DELTA) as Direction[]).forEach((dir) => {
    if (nextCell(current, dir, parsed)) out.add(dir);
  });
  return out;
}

/** Opening cell: the filled slide nearest the grid centre, ties by reading order. */
export function entryCell(parsed: ParsedLayout): Cell {
  const cx = (parsed.cols - 1) / 2;
  const cy = (parsed.rows - 1) / 2;
  let best: Slide | null = null;
  let bestDist = Infinity;
  for (const s of parsed.slides) {
    const dist = (s.row - cy) ** 2 + (s.col - cx) ** 2;
    if (dist < bestDist) {
      bestDist = dist;
      best = s;
    }
  }
  return best ? { row: best.row, col: best.col } : { row: 0, col: 0 };
}

export const MOVE_THRESHOLD = 20;

/**
 * Map a 2D delta to a single direction, or null below `threshold`.
 * Positive dy = down, positive dx = right; vertical wins ties.
 * Wheel handlers pass raw deltas; touch handlers pass negated deltas
 * (swiping up should advance downward).
 */
export function axisDirection(
  dx: number,
  dy: number,
  threshold: number = MOVE_THRESHOLD,
): Direction | null {
  if (Math.max(Math.abs(dx), Math.abs(dy)) < threshold) return null;
  if (Math.abs(dy) >= Math.abs(dx)) return dy > 0 ? "down" : "up";
  return dx > 0 ? "right" : "left";
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `pnpm exec vitest run src/lib/canvas/nav.test.ts`
Expected: PASS (all describe blocks green).

- [ ] **Step 6: Commit**

```bash
git add src/lib/canvas/
git commit -m "feat(canvas): pure layout + navigation logic with tests

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: Slide component

**Files:**

- Create: `src/lib/components/canvas/Slide.svelte`

- [ ] **Step 1: Write Slide.svelte**

Create `src/lib/components/canvas/Slide.svelte`:

```svelte
<script lang="ts">
  import type { Snippet } from "svelte";
  import type { Slide } from "$lib/canvas/nav";

  let {
    slide,
    current = false,
    children,
  }: {
    slide: Slide;
    current?: boolean;
    children?: Snippet<[Slide]>;
  } = $props();
</script>

<section
  class="slide"
  class:is-current={current}
  style="--slide-color: {slide.color}; grid-row: {slide.row +
    1}; grid-column: {slide.col + 1};"
  aria-label={`Slide ${slide.label}`}
  aria-current={current ? "true" : undefined}
>
  {#if children}
    {@render children(slide)}
  {:else}
    <span class="slide__label">{slide.label}</span>
  {/if}
</section>

<style>
  .slide {
    width: 100vw;
    height: 100vh;
    display: grid;
    place-items: center;
    background: var(--slide-color);
    color: #fff;
    user-select: none;
  }
  .slide__label {
    font-size: 22vmin;
    font-weight: 800;
    letter-spacing: -0.03em;
    opacity: 0.9;
  }
</style>
```

- [ ] **Step 2: Type-check**

Run: `pnpm check`
Expected: PASS (0 errors). (Warnings from copied starter code are acceptable; there must be no errors introduced by this file.)

- [ ] **Step 3: Commit**

```bash
git add src/lib/components/canvas/Slide.svelte
git commit -m "feat(canvas): Slide cell component

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: Canvas engine + component test

**Files:**

- Create: `src/lib/components/canvas/Canvas.svelte`
- Test: `src/lib/components/canvas/Canvas.test.ts`

> NavArrows and Minimap are added in Task 5. To keep this task's build green, Canvas imports them from Task 5's paths — so create the two child files as stubs in Step 1 below, then flesh them out in Task 5.

- [ ] **Step 1: Create temporary stubs for the two child components**

Create `src/lib/components/canvas/NavArrows.svelte`:

```svelte
<script lang="ts">
  import type { Direction } from "$lib/canvas/nav";
  let {
    reachable,
    onmove,
  }: { reachable: Set<Direction>; onmove: (d: Direction) => void } = $props();
</script>
```

Create `src/lib/components/canvas/Minimap.svelte`:

```svelte
<script lang="ts">
  import type { ParsedLayout, Cell } from "$lib/canvas/nav";
  let { parsed, current }: { parsed: ParsedLayout; current: Cell } = $props();
</script>
```

- [ ] **Step 2: Write Canvas.svelte**

Create `src/lib/components/canvas/Canvas.svelte`:

```svelte
<script lang="ts">
  import type { Cell, Direction, Layout } from "$lib/canvas/nav";
  import {
    parseLayout,
    nextCell,
    entryCell,
    reachableDirections,
    axisDirection,
  } from "$lib/canvas/nav";
  import Slide from "./Slide.svelte";
  import NavArrows from "./NavArrows.svelte";
  import Minimap from "./Minimap.svelte";

  let { layout }: { layout: Layout } = $props();

  const parsed = $derived(parseLayout(layout));
  let current = $state<Cell>(entryCell(parseLayout(layout)));
  let isAnimating = $state(false);
  let reduced = $state(false);

  $effect(() => {
    reduced =
      typeof window !== "undefined" && window.matchMedia
        ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
        : false;
  });

  const reachable = $derived(reachableDirections(current, parsed));

  function move(dir: Direction | null) {
    if (!dir || isAnimating) return;
    const target = nextCell(current, dir, parsed);
    if (!target) return;
    current = target;
    if (!reduced) isAnimating = true; // released on transitionend
  }

  function onTransitionEnd(e: TransitionEvent) {
    if (e.propertyName === "transform") isAnimating = false;
  }

  const KEY_DIR: Record<string, Direction> = {
    ArrowUp: "up",
    ArrowDown: "down",
    ArrowLeft: "left",
    ArrowRight: "right",
    w: "up",
    s: "down",
    a: "left",
    d: "right",
  };

  function onKeydown(e: KeyboardEvent) {
    const dir = KEY_DIR[e.key];
    if (!dir) return;
    e.preventDefault();
    move(dir);
  }

  function onWheel(e: WheelEvent) {
    e.preventDefault();
    move(axisDirection(e.deltaX, e.deltaY));
  }

  let touchX = 0;
  let touchY = 0;
  function onTouchStart(e: TouchEvent) {
    touchX = e.touches[0].clientX;
    touchY = e.touches[0].clientY;
  }
  function onTouchEnd(e: TouchEvent) {
    const t = e.changedTouches[0];
    // Negate: swiping up (dy<0) should advance downward.
    move(axisDirection(-(t.clientX - touchX), -(t.clientY - touchY), 40));
  }
</script>

<svelte:window onkeydown={onKeydown} />

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
  class="viewport"
  role="application"
  aria-label="Canvas navigation. Use the arrow keys to move between slides."
  tabindex="0"
  onwheel={onWheel}
  ontouchstart={onTouchStart}
  ontouchend={onTouchEnd}
>
  <div
    class="board"
    class:no-motion={reduced}
    data-cell={`${current.row},${current.col}`}
    style="grid-template-columns: repeat({parsed.cols}, 100vw); grid-template-rows: repeat({parsed.rows}, 100vh); transform: translate3d(calc({current.col} * -100vw), calc({current.row} * -100vh), 0);"
    ontransitionend={onTransitionEnd}
  >
    {#each parsed.slides as slide (slide.label)}
      <Slide
        {slide}
        current={slide.row === current.row && slide.col === current.col}
      />
    {/each}
  </div>

  <NavArrows {reachable} onmove={move} />
  <Minimap {parsed} {current} />
</div>

<style>
  .viewport {
    position: fixed;
    inset: 0;
    overflow: hidden;
    background: #0b0b0f;
    outline: none;
  }
  .board {
    display: grid;
    width: max-content;
    height: max-content;
    transition: transform 550ms cubic-bezier(0.65, 0, 0.35, 1);
    will-change: transform;
  }
  .board.no-motion {
    transition: none;
  }
</style>
```

- [ ] **Step 3: Write the component test**

Create `src/lib/components/canvas/Canvas.test.ts`:

```ts
import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/svelte";
import Canvas from "./Canvas.svelte";
import { PRESETS } from "$lib/canvas/presets";

afterEach(cleanup);

function board(container: HTMLElement): HTMLElement {
  const el = container.querySelector<HTMLElement>(".board");
  if (!el) throw new Error("board not found");
  return el;
}

// jsdom does not fire CSS transitions, so release the animation lock by hand.
function endTransition(el: HTMLElement) {
  const ev = new Event("transitionend");
  Object.defineProperty(ev, "propertyName", { value: "transform" });
  el.dispatchEvent(ev);
}

describe("Canvas keyboard navigation", () => {
  it("opens plus5 at the centre cell", () => {
    const { container } = render(Canvas, { props: { layout: PRESETS.plus5 } });
    expect(board(container).dataset.cell).toBe("1,1");
  });

  it("moves down to a filled neighbour on ArrowDown", async () => {
    const { container } = render(Canvas, { props: { layout: PRESETS.plus5 } });
    await fireEvent.keyDown(window, { key: "ArrowDown" });
    expect(board(container).dataset.cell).toBe("2,1");
  });

  it("ignores input while animating, then accepts after the transition ends", async () => {
    const { container } = render(Canvas, { props: { layout: PRESETS.plus5 } });
    await fireEvent.keyDown(window, { key: "ArrowDown" }); // 1,1 -> 2,1, now animating
    await fireEvent.keyDown(window, { key: "ArrowUp" }); // ignored (locked)
    expect(board(container).dataset.cell).toBe("2,1");

    endTransition(board(container));
    await fireEvent.keyDown(window, { key: "ArrowUp" }); // 2,1 -> 1,1
    expect(board(container).dataset.cell).toBe("1,1");
  });

  it("does not move toward an empty neighbour", async () => {
    const { container } = render(Canvas, { props: { layout: PRESETS.plus5 } });
    await fireEvent.keyDown(window, { key: "ArrowUp" }); // 1,1 -> 0,1
    endTransition(board(container));
    await fireEvent.keyDown(window, { key: "ArrowLeft" }); // 0,0 is empty -> no move
    expect(board(container).dataset.cell).toBe("0,1");
  });
});
```

- [ ] **Step 4: Run the component test**

Run: `pnpm exec vitest run src/lib/components/canvas/Canvas.test.ts`
Expected: PASS (all four cases).

- [ ] **Step 5: Commit**

```bash
git add src/lib/components/canvas/
git commit -m "feat(canvas): Canvas engine (board, input, gating) with component test

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: NavArrows + Minimap (discoverability)

**Files:**

- Modify: `src/lib/components/canvas/NavArrows.svelte` (replace the Task 4 stub)
- Modify: `src/lib/components/canvas/Minimap.svelte` (replace the Task 4 stub)

- [ ] **Step 1: Flesh out NavArrows.svelte**

Replace the entire contents of `src/lib/components/canvas/NavArrows.svelte`:

```svelte
<script lang="ts">
  import type { Direction } from "$lib/canvas/nav";

  let {
    reachable,
    onmove,
  }: { reachable: Set<Direction>; onmove: (d: Direction) => void } = $props();

  const arrows: { dir: Direction; glyph: string }[] = [
    { dir: "up", glyph: "↑" },
    { dir: "left", glyph: "←" },
    { dir: "right", glyph: "→" },
    { dir: "down", glyph: "↓" },
  ];
</script>

<!-- Visual affordance only; keyboard already provides real navigation. -->
<div class="arrows" aria-hidden="true">
  {#each arrows as a (a.dir)}
    <button
      class="arrow {a.dir}"
      class:active={reachable.has(a.dir)}
      disabled={!reachable.has(a.dir)}
      tabindex="-1"
      onclick={() => onmove(a.dir)}
    >
      {a.glyph}
    </button>
  {/each}
</div>

<style>
  .arrows {
    position: fixed;
    left: 50%;
    bottom: 1.75rem;
    transform: translateX(-50%);
    display: grid;
    grid-template-columns: repeat(3, 2.25rem);
    grid-template-rows: repeat(2, 2.25rem);
    gap: 0.35rem;
    z-index: 10;
  }
  .arrow {
    display: grid;
    place-items: center;
    width: 2.25rem;
    height: 2.25rem;
    border: none;
    border-radius: 0.5rem;
    background: rgba(255, 255, 255, 0.12);
    color: rgba(255, 255, 255, 0.35);
    font-size: 1.1rem;
    cursor: default;
    transition:
      opacity 150ms ease,
      background 150ms ease,
      color 150ms ease;
  }
  .arrow.active {
    background: rgba(255, 255, 255, 0.85);
    color: #0b0b0f;
    cursor: pointer;
  }
  /* plus arrangement within the 3x2 grid */
  .arrow.up {
    grid-column: 2;
    grid-row: 1;
  }
  .arrow.left {
    grid-column: 1;
    grid-row: 2;
  }
  .arrow.down {
    grid-column: 2;
    grid-row: 2;
  }
  .arrow.right {
    grid-column: 3;
    grid-row: 2;
  }
</style>
```

- [ ] **Step 2: Flesh out Minimap.svelte**

Replace the entire contents of `src/lib/components/canvas/Minimap.svelte`:

```svelte
<script lang="ts">
  import type { ParsedLayout, Cell } from "$lib/canvas/nav";
  import { cellKey } from "$lib/canvas/nav";

  let { parsed, current }: { parsed: ParsedLayout; current: Cell } = $props();

  const rows = $derived([...Array(parsed.rows).keys()]);
  const cols = $derived([...Array(parsed.cols).keys()]);
</script>

<div
  class="minimap"
  aria-hidden="true"
  style="grid-template-columns: repeat({parsed.cols}, 0.6rem);"
>
  {#each rows as r (r)}
    {#each cols as c (c)}
      <span
        class="dot"
        class:filled={parsed.filled.has(cellKey(r, c))}
        class:current={r === current.row && c === current.col}
      ></span>
    {/each}
  {/each}
</div>

<style>
  .minimap {
    position: fixed;
    top: 1.25rem;
    right: 1.25rem;
    display: grid;
    gap: 0.3rem;
    z-index: 10;
  }
  .dot {
    width: 0.6rem;
    height: 0.6rem;
    border-radius: 50%;
    background: transparent;
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.25);
  }
  .dot.filled {
    background: rgba(255, 255, 255, 0.3);
    box-shadow: none;
  }
  .dot.current {
    background: #fff;
  }
</style>
```

- [ ] **Step 3: Type-check**

Run: `pnpm check`
Expected: PASS (0 errors).

- [ ] **Step 4: Re-run the Canvas component test (regression)**

Run: `pnpm exec vitest run src/lib/components/canvas/Canvas.test.ts`
Expected: PASS (unchanged — arrows/minimap don't affect navigation state).

- [ ] **Step 5: Commit**

```bash
git add src/lib/components/canvas/NavArrows.svelte src/lib/components/canvas/Minimap.svelte
git commit -m "feat(canvas): directional arrows + minimap indicator

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: Layout switcher + mount the canvas at `/`

**Files:**

- Create: `src/lib/components/canvas/LayoutSwitcher.svelte`
- Modify: `src/routes/[[preview=preview]]/+page.svelte`
- Delete: `src/routes/[[preview=preview]]/+page.server.ts`

- [ ] **Step 1: Write LayoutSwitcher.svelte**

Create `src/lib/components/canvas/LayoutSwitcher.svelte`:

```svelte
<script lang="ts">
  import { PRESETS, type PresetName } from "$lib/canvas/presets";

  let {
    active,
    onselect,
  }: { active: PresetName; onselect: (name: PresetName) => void } = $props();

  const names = Object.keys(PRESETS) as PresetName[];
</script>

<nav class="switcher" aria-label="Choose layout">
  {#each names as name (name)}
    <button
      class="chip"
      class:active={name === active}
      aria-pressed={name === active}
      onclick={() => onselect(name)}
    >
      {name}
    </button>
  {/each}
</nav>

<style>
  .switcher {
    position: fixed;
    top: 1.25rem;
    left: 1.25rem;
    display: flex;
    gap: 0.4rem;
    z-index: 10;
  }
  .chip {
    padding: 0.3rem 0.6rem;
    border: none;
    border-radius: 0.45rem;
    background: rgba(255, 255, 255, 0.12);
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.8rem;
    font-family: ui-monospace, monospace;
    cursor: pointer;
  }
  .chip.active {
    background: #fff;
    color: #0b0b0f;
  }
</style>
```

- [ ] **Step 2: Delete the Prismic homepage loader**

Run:

```bash
git rm src/routes/[[preview=preview]]/+page.server.ts
```

Expected: file staged for deletion. (Prismic loading patterns remain in `src/routes/[[preview=preview]]/[uid]/+page.server.ts` and `$lib/prismicio.ts`.)

- [ ] **Step 3: Replace the homepage with the canvas mount**

Replace the entire contents of `src/routes/[[preview=preview]]/+page.svelte`:

```svelte
<script lang="ts">
  import Canvas from "$lib/components/canvas/Canvas.svelte";
  import LayoutSwitcher from "$lib/components/canvas/LayoutSwitcher.svelte";
  import { PRESETS, type PresetName } from "$lib/canvas/presets";

  let active = $state<PresetName>("plus5");
</script>

<svelte:head>
  <title>Canvas Navigation</title>
  <meta
    name="description"
    content="A 2D directional-snap canvas navigation prototype."
  />
</svelte:head>

<!-- Remount Canvas on preset change so position/animation state resets cleanly. -->
{#key active}
  <Canvas layout={PRESETS[active]} />
{/key}

<LayoutSwitcher {active} onselect={(name) => (active = name)} />
```

- [ ] **Step 4: Type-check**

Run: `pnpm check`
Expected: PASS (0 errors).

- [ ] **Step 5: Run the full unit suite**

Run: `pnpm test:unit`
Expected: PASS (nav + Canvas tests plus the copied starter tests).

- [ ] **Step 6: Manual smoke in the dev server**

Run: `pnpm vite:dev` (then open the printed localhost URL).
Verify by hand:

- The plus5 layout shows a centered colored slide with a big "2".
- Arrow keys / WASD glide to neighbors; only filled directions move (top arm: only Down works).
- Trackpad two-finger swipe and (on a touch device) swipe navigate one cell per gesture.
- The bottom arrow cluster lights only reachable directions; the top-right minimap dot tracks position.
- The top-left switcher flips between t4 / plus5 / grid6 / grid9 and resets to that layout's entry cell.
  Stop the server (Ctrl-C) when satisfied.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(canvas): layout switcher + mount canvas at /

Replace the Prismic homepage with the canvas; drop its server load.
Prismic scaffolding remains inert for later templatizing.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 7: Production build gate + README

**Files:**

- Create: `README.md`

- [ ] **Step 1: Full production build with no Prismic repo**

Run: `pnpm build`
Expected: PASS. The build completes without Prismic credentials because `isPlaceholderRepo` is true (slicemachine.config.json still has `"your-prismic-repo-name"`) and `/` is now our static canvas page.
If it fails on a Prismic-backed route (e.g. `products/[slug]` or `[uid]`), that route lacks a placeholder guard — add `export const prerender = false;` to that route's `+page.server.ts` and re-run. (These routes are inert stubs; they are not part of the prototype.)

- [ ] **Step 2: Lint/format check**

Run: `pnpm lint`
Expected: PASS. If formatting fails, run `pnpm format` then re-run `pnpm lint`.

- [ ] **Step 3: Write README.md**

Create `README.md`:

````markdown
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
````

## Architecture

- `src/lib/canvas/nav.ts` — pure, unit-tested navigation logic
- `src/lib/canvas/presets.ts` — the four layouts
- `src/lib/components/canvas/` — Canvas engine, Slide, NavArrows, Minimap, LayoutSwitcher
- Canvas mounts at `/` (`src/routes/[[preview=preview]]/+page.svelte`)

````

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "docs: project README

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
````

---

## Task 8: Publish to GitHub (public) + Netlify

> Outward-facing actions. The user authorized: public repo under `reddoorla`, deployed to Netlify. Confirm before running Step 1 if any detail is uncertain.

**Files:** none (git/hosting only)

- [ ] **Step 1: Create the public repo under reddoorla and push**

Run (from `~/Documents/GitHub/canvas-starter`):

```bash
gh repo create reddoorla/canvas-starter \
  --public \
  --source=. \
  --remote=origin \
  --description "2D directional-snap canvas navigation prototype (SvelteKit)" \
  --push
```

Expected: repo created at https://github.com/reddoorla/canvas-starter and `main` pushed. Verify: `gh repo view reddoorla/canvas-starter --web`.

- [ ] **Step 2: Deploy to Netlify**

The repo already has `netlify.toml` + `@sveltejs/adapter-netlify`, so no build config is needed. Two options:

Option A — Netlify UI (simplest, no extra CLI/auth):

1. Netlify → **Add new site → Import an existing project → GitHub → `reddoorla/canvas-starter`**.
2. Accept the detected build command `pnpm build` and publish directory from `netlify.toml`.
3. Deploy. Share the generated `*.netlify.app` URL.

Option B — Netlify CLI (if installed and authed):

```bash
netlify init      # link to a new site under the reddoorla team
netlify deploy --build --prod
```

- [ ] **Step 3: Verify the live URL**

Open the Netlify URL and repeat the Task 6 Step 6 smoke checks in the deployed build. Confirm no Prismic errors in the deploy log.

---

## Self-Review (completed by plan author)

**Spec coverage:**

- Directional snap (wheel/keys/touch), one move per gesture → Task 4 (`onWheel`/`onKeydown`/touch + `isAnimating` gate). ✓
- Smooth glide + reduced-motion fallback → Task 4 (`.board` transition + `.no-motion`). ✓
- Flexible 4-layout engine → Task 2 (`presets.ts`, `parseLayout`) + Task 6 (`LayoutSwitcher`). ✓
- Hardcoded placeholder slides → Task 2 (label/color) + Task 3 (`Slide`). ✓
- Hard edges, empty-neighbor no-op → Task 2 (`nextCell` returns null) + tests. ✓
- Discoverability arrows + minimap → Task 5. ✓
- entryCell (nearest-center) → Task 2 + tests. ✓
- Copy starter, Prismic inert, canvas at `/` → Task 1 + Task 6. ✓
- Public repo + Netlify → Task 8. ✓
- TDD nav.ts + interaction test → Tasks 2 & 4. ✓ (Playwright smoke intentionally swapped for a Vitest component test — see plan intro.)

**Placeholder scan:** No TBD/TODO; every code step contains complete code. ✓

**Type consistency:** `Layout`/`Cell`/`Direction`/`ParsedLayout`/`Slide` and functions `parseLayout`/`nextCell`/`entryCell`/`reachableDirections`/`axisDirection`/`cellKey` are used identically across nav.ts, presets.ts, and all components. `move()` signature `(Direction | null) => void` matches the `onmove` prop consumed by NavArrows. `PresetName` used consistently in presets.ts, LayoutSwitcher, and the route. ✓
