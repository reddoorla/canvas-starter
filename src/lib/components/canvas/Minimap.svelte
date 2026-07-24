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
