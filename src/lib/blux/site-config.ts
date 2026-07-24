// Site chrome (navigation + footer) from the Blux convert's site-config.json.
// The starter ships an empty stub, so a fresh (unconverted) site renders the
// logo-only Nav + placeholder Footer exactly as before; `blux convert` replaces
// it with the export's real nav tree, logo, and footer. Mirrors the emit
// contract in reddoor-maintenance src/blux/emit/site-config.ts.
import config from "./site-config.json";

export type NavItem = { label: string; href: string; children?: NavItem[] };
export type FooterSocial = { network: string; href?: string };

export type SiteConfig = {
  nav: {
    logo?: { url: string; maxWidth?: string };
    items: NavItem[];
  };
  footer: {
    socials: FooterSocial[];
    text?: string;
  };
};

/** The checked-in site config (empty until `blux convert`). */
export function loadSiteConfig(): SiteConfig {
  return config as SiteConfig;
}
