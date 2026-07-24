<script lang="ts">
  import type { Snippet } from "svelte";
  import type { Slide } from "$lib/canvas/nav";

  let {
    slide,
    current = false,
    children,
  }: { slide: Slide; current?: boolean; children?: Snippet<[Slide]> } = $props();
</script>

<section
  class="slide"
  class:is-current={current}
  style="--slide-color: {slide.color}; grid-row: {slide.row + 1}; grid-column: {slide.col + 1};"
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
