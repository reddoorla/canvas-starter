import { describe, it, expect } from "vitest";
import { loadSiteConfig } from "./site-config";

describe("loadSiteConfig", () => {
  it("returns a well-formed config from the checked-in stub", () => {
    const config = loadSiteConfig();
    // The starter ships an empty stub; the shape must always be safe to spread
    // into <Nav items> / <Footer socials> without guards at the call site.
    expect(Array.isArray(config.nav.items)).toBe(true);
    expect(Array.isArray(config.footer.socials)).toBe(true);
  });
});
