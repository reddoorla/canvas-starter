import { describe, it, expect, vi } from "vitest";

// robots.txt is prerendered here, and kit 3 prerenders with the placeholder
// origin "http://sveltekit-prerender" (paths.origin is unset on purpose:
// sveltekit.config.js says why). $lib/seo's siteOrigin puts the build's
// production origin in its place. In vitest the build has no URL, so the build
// origin is fixed here through the mock.
vi.mock("$lib/seo", async (importOriginal) => {
  const actual = await importOriginal<typeof import("$lib/seo")>();
  return {
    ...actual,
    siteOrigin: (url: Pick<URL, "origin"> | string) =>
      actual.siteOrigin(url, "https://www.example.com"),
  };
});

const { GET } = await import("./+server");

describe("GET /robots.txt while prerendering", () => {
  it("points at the sitemap on the build's origin, not kit's placeholder", async () => {
    const response = await GET({
      url: new URL("http://sveltekit-prerender/robots.txt"),
    } as Parameters<typeof GET>[0]);
    const body = await response.text();
    expect(body).toContain("Sitemap: https://www.example.com/sitemap.xml");
    expect(body).not.toContain("sveltekit-prerender");
  });
});
