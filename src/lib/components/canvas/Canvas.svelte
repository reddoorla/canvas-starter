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
