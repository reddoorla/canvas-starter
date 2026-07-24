import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/svelte";
import Footer from "./Footer.svelte";

afterEach(() => cleanup());

describe("Footer", () => {
  it("falls back to a generic notice with no props", () => {
    const { container, queryByRole } = render(Footer);
    // No socials → no list; the copyright line is always present.
    expect(container.querySelector("ul")).toBeNull();
    expect(container.textContent).toContain("Company Name");
    expect(queryByRole("list")).toBeNull();
  });

  it("renders the supplied rights line verbatim", () => {
    const text = "© Composition Hospitality 2017, All Rights Reserved";
    const { container } = render(Footer, { text });
    expect(container.textContent).toContain(text);
  });

  it("renders a labelled, new-tab link per known social network", () => {
    const { getByLabelText } = render(Footer, {
      socials: [
        { network: "facebook", href: "https://fb.com/x" },
        { network: "instagram", href: "https://ig.com/x" },
      ],
    });
    const fb = getByLabelText("Facebook");
    expect(fb.getAttribute("href")).toBe("https://fb.com/x");
    expect(fb.getAttribute("target")).toBe("_blank");
    expect(fb.getAttribute("rel")).toBe("noopener noreferrer");
    expect(getByLabelText("Instagram")).toBeTruthy();
  });

  it("aliases linkedin-company to the LinkedIn icon", () => {
    const { getByLabelText } = render(Footer, {
      socials: [{ network: "linkedin-company", href: "https://lnkd.in/x" }],
    });
    expect(getByLabelText("LinkedIn")).toBeTruthy();
  });

  it("drops unknown networks and prototype-chain member names", () => {
    const { container } = render(Footer, {
      socials: [
        { network: "myspace" },
        { network: "toString" },
        { network: "constructor" },
        { network: "__proto__" },
      ],
    });
    // None are real networks → no list is rendered and nothing throws.
    expect(container.querySelector("ul")).toBeNull();
  });

  it("renders a hrefless social as a non-interactive glyph, not a dead link", () => {
    const { getByLabelText, container } = render(Footer, {
      socials: [{ network: "youtube" }],
    });
    const yt = getByLabelText("YouTube");
    // No <a> (a href="#" would be a dead link); a labelled role=img span instead.
    expect(yt.tagName).toBe("SPAN");
    expect(yt.getAttribute("role")).toBe("img");
    expect(container.querySelector("a")).toBeNull();
    // The brand glyph still renders.
    expect(container.querySelector("svg")).toBeTruthy();
  });
});
