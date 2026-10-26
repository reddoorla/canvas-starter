import { createClient, isPlaceholderRepo } from "$lib/prismicio";
import { siteOrigin } from "$lib/seo";
import type { RequestHandler } from "./$types";

export const prerender = true;

export const GET: RequestHandler = async ({ fetch, url }) => {
  const client = createClient({ fetch });
  const pages = isPlaceholderRepo ? [] : await client.getAllByType("page");
  // Prerendered: kit 3 gives `url` its placeholder origin, and siteOrigin puts
  // the build's production origin in its place (sveltekit.config.js).
  const origin = siteOrigin(url);

  const urls = pages.map((page) => {
    const path = page.uid === "home" ? "/" : `/${page.uid}`;
    const lastmod = new Date(page.last_publication_date ?? Date.now()).toISOString();
    return `  <url>
    <loc>${origin}${path}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml" },
  });
};
