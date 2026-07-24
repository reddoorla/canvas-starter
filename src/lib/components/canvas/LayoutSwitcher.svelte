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
