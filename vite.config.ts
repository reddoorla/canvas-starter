import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vitest/config";
import { imagetools } from "@zerodevx/svelte-img/vite";
import tailwindcss from "@tailwindcss/vite";
import kitConfig, { productionOrigin } from "./sveltekit.config.js";

export default defineConfig({
  // SvelteKit 3 takes its configuration here, not from svelte.config.js
  // (which it refuses to start beside). The object lives in sveltekit.config.js
  // so eslint reads the same one.
  plugins: [sveltekit(kitConfig), imagetools(), tailwindcss()],
  // The production origin for prerendered canonical, og:url, robots.txt and
  // sitemap.xml, in place of kit's placeholder (sveltekit.config.js says why it
  // is not paths.origin).
  define: { __REDDOOR_SITE_ORIGIN__: JSON.stringify(productionOrigin) },
  server: {
    fs: {
      // Allow access to files from the project root.
      allow: [".."],
    },
  },
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.{js,ts}"],
    setupFiles: ["./vitest-setup.ts"],
    server: {
      deps: {
        inline: ["@testing-library/svelte"],
      },
    },
  },
  resolve: process.env.VITEST ? { conditions: ["browser"] } : undefined,
});
