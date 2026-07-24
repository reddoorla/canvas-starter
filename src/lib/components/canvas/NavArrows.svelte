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
    transition: opacity 150ms ease, background 150ms ease, color 150ms ease;
  }
  .arrow.active {
    background: rgba(255, 255, 255, 0.85);
    color: #0b0b0f;
    cursor: pointer;
  }
  /* plus arrangement within the 3x2 grid */
  .arrow.up { grid-column: 2; grid-row: 1; }
  .arrow.left { grid-column: 1; grid-row: 2; }
  .arrow.down { grid-column: 2; grid-row: 2; }
  .arrow.right { grid-column: 3; grid-row: 2; }
</style>
