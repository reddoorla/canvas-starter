import { readFileSync } from "node:fs";
import adapter from "@sveltejs/adapter-netlify";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

const slicemachine = JSON.parse(
  readFileSync(new URL("./slicemachine.config.json", import.meta.url), "utf-8"),
);
const isPlaceholderRepo =
  (process.env.VITE_PRISMIC_ENVIRONMENT || slicemachine.repositoryName) ===
  "your-prismic-repo-name";

// VITE_REDDOOR_GATE_FIXTURES=1 builds the /dev fixtures into the bundle, for
// the a11y gate's own build and nothing else (src/routes/dev/+layout.server.ts,
// reddoor-maintenance#948). Set on Netlify it would deploy them, so refuse it
// there, at module load.
if (process.env.VITE_REDDOOR_GATE_FIXTURES && process.env.NETLIFY) {
  throw new Error(
    "VITE_REDDOOR_GATE_FIXTURES is set on Netlify: it builds the /dev fixtures into the " +
      "deployed site. It belongs to the a11y gate's own build (reddoor-maint audit) only. " +
      "Unset it in the Netlify environment.",
  );
}

// Netlify sets URL to the site's production origin during a build, and
// prerendered pages bake it into canonical and og:url. Kit 2 took it as
// `prerender.origin`. Kit 3 removed that for `paths.origin`, which also
// becomes the ONLY origin the CSRF check accepts a form POST from (kit 2
// compared with the request's own host). Set, the contact form answered 403 on
// a Netlify domain alias, and on a custom domain attached after the last build
// until the next deploy (measured on a built server, reddoor-starter#187). So
// it is not set: kit keeps its "http://sveltekit-prerender" placeholder and the
// per-host CSRF check, and vite.config.ts hands this origin to $lib/seo, which
// puts it in place of the placeholder. Local builds set no URL and keep the
// placeholder, which only shows up in build/ output, never in dev.
// robots.txt and sitemap.xml are prerendered in this repo (the starter moved
// them to per-request answers, reddoor-starter#140), so they take the origin
// through $lib/seo's siteOrigin too.
/** @param {string | undefined} value */
const originOf = (value) => {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.origin : undefined;
  } catch {
    return undefined;
  }
};
export const productionOrigin = originOf(process.env.URL) ?? null;

// SvelteKit 3 refuses `svelte.config.js` (`config_file_unsupported`): its
// configuration is passed to the `sveltekit(...)` plugin in vite.config.ts,
// and kit's options are top-level there, with no `kit` namespace. This object
// is that argument. It lives in its own module, not inline in vite.config.ts,
// because eslint.config.js reads the same object, and it imports it with a bare
// `node` (no Vite).
/** @type {import('@sveltejs/kit/vite').Config} */
const config = {
  compilerOptions: {
    warningFilter: (warning) => warning.code !== "element_invalid_self_closing_tag",
  },
  adapter: adapter(),
  // Until a clone is wired to a real Prismic repo, every Prismic-backed
  // route returns 404 during prerender. Tolerate that on the placeholder
  // so `pnpm build` (and Netlify CI) succeed; real sites still fail loudly
  // because `repositoryName` no longer matches the sentinel.
  prerender: {
    handleHttpError: ({ path, status, message, referrer }) => {
      if (isPlaceholderRepo && status === 404) {
        return;
      }
      throw new Error(
        `${status} ${path}${referrer ? ` (linked from ${referrer})` : ""}: ${message}`,
      );
    },
  },
  // `alias` is deprecated in kit 3 (a build warning) in favour of package.json
  // subpath imports (`#lib`), and kit 3 no longer provides `$lib` itself. The
  // `$lib` entries keep every existing import working; moving the fleet to
  // `#lib` is a separate codemod (reddoor-maintenance P1-45's plan).
  alias: {
    $lib: "src/lib",
    "$lib/*": "src/lib/*",
    $components: "src/lib/components",
    "$components/*": "src/lib/components/*",
    $utils: "src/lib/utils",
    "$utils/*": "src/lib/utils/*",
    $stores: "src/lib/stores",
    "$stores/*": "src/lib/stores/*",
    $assets: "src/lib/assets",
    "$assets/*": "src/lib/assets/*",
  },
  // Baseline CSP for Prismic + Vimeo. Extend per project — any new CDN or
  // analytics host must be added to the relevant directive. SvelteKit
  // automatically adds nonces/hashes for inline scripts and styles it emits.
  csp: {
    mode: "auto",
    // Violations POST to /api/csp-report. To stage a stricter policy without
    // blocking, copy `directives` below into a sibling `reportOnly: { ... }`
    // block — SvelteKit will then emit a Content-Security-Policy-Report-Only
    // header alongside the enforced one.
    directives: {
      "default-src": ["self"],
      "script-src": [
        "self",
        "https://static.cdn.prismic.io",
        "https://player.vimeo.com",
        // Cloudflare Turnstile contact-form widget (enable via PUBLIC_TURNSTILE_SITE_KEY).
        "https://challenges.cloudflare.com",
      ],
      "style-src": ["self", "unsafe-inline"],
      "img-src": ["self", "data:", "https://images.prismic.io", "https://*.prismic.io"],
      "media-src": ["self", "https://*.vimeocdn.com"],
      "frame-src": [
        "self",
        "https://player.vimeo.com",
        // Cloudflare Turnstile renders its challenge in an iframe from this host.
        "https://challenges.cloudflare.com",
      ],
      "connect-src": ["self", "https://*.prismic.io", "https://static.cdn.prismic.io"],
      "font-src": ["self", "data:"],
      "base-uri": ["self"],
      "form-action": ["self"],
      "frame-ancestors": ["self"],
      "report-uri": ["/api/csp-report"],
    },
  },
  preprocess: vitePreprocess(),
};

export default config;
