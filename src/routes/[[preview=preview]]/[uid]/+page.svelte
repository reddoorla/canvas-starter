<script lang="ts">
  import { SliceZone } from "@prismicio/svelte";
  import { page } from "$app/state";
  import { components } from "$lib/slices";
  import { loadPresentation } from "$lib/blux/presentation";

  let { data } = $props();
</script>

<!-- Per-band Blux presentation (block styles, backgrounds, grid trees) from
     the faithful-grid manifest, selected by page uid (a multi-page manifest
     namespaces bands per page; the flat single-page form ignores the uid).
     Empty until the site is converted with `blux convert`; SliceZone hands
     it to every slice as `context`. -->
<SliceZone
  slices={data.page.data.slices}
  {components}
  context={{ presentation: loadPresentation(page.params["uid"]) }}
/>
