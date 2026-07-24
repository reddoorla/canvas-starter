import type { PageLoad } from "./$types";

// Static SEO for the canvas homepage. The root layout (src/routes/+layout.svelte)
// is the single <head> source and reads these off page.data — so og:/twitter:
// tags stay in sync. No Prismic involved.
export const load: PageLoad = () => ({
  title: "Canvas Navigation",
  meta_description:
    "A 2D directional-snap canvas navigation prototype — glide a grid of slides up, down, left, and right.",
});
