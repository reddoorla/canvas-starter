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
