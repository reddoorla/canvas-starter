<script lang="ts">
  import Canvas from "$lib/components/canvas/Canvas.svelte";
  import LayoutSwitcher from "$lib/components/canvas/LayoutSwitcher.svelte";
  import { PRESETS, type PresetName } from "$lib/canvas/presets";

  let active = $state<PresetName>("plus5");
</script>

<!-- Remount Canvas on preset change so position/animation state resets cleanly. -->
{#key active}
  <Canvas layout={PRESETS[active]} />
{/key}

<LayoutSwitcher {active} onselect={(name) => (active = name)} />
