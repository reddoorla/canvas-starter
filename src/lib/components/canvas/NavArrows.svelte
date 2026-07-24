<script lang="ts">
  import type { Direction } from "$lib/canvas/nav";
  let { reachable, onmove }: { reachable: Set<Direction>; onmove: (d: Direction) => void } = $props();
</script>
