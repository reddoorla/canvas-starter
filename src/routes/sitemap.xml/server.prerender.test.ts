import { describe, it, expect, vi } from "vitest";

// sitemap.xml is prerendered here, and kit 3 prerenders with the placeholder
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
vi.mock("$lib/prismicio", () => ({
  isPlaceholderRepo: false,
  createClient: () => ({
    getAllByType: async () => [
      { uid: "home", last_publication_date: "2026-10-01T00:00:00Z" },
      { uid: "about", last_publication_date: "2026-10-02T00:00:00Z" },
    ],
  }),
}));

const { GET } = await import("./+server");

describe("GET /sitemap.xml while prerendering", () => {
  it("lists every page on the build's origin, not kit's placeholder", async () => {
    const response = await GET({
      fetch,
      url: new URL("http://sveltekit-prerender/sitemap.xml"),
    } as unknown as Parameters<typeof GET>[0]);
    const xml = await response.text();
    expect(xml).toContain("<loc>https://www.example.com/</loc>");
    expect(xml).toContain("<loc>https://www.example.com/about</loc>");
    expect(xml).not.toContain("sveltekit-prerender");
  });
});
