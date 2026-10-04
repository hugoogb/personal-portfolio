/**
 * Bakes the rendered page into dist/index.html, which the client then hydrates.
 *
 * The site is one page that is identical for every visitor, so it is rendered
 * once, at build time. Without this the HTML is an empty <div id="root"> and
 * every crawler that does not run JavaScript - link previews, most AI crawlers,
 * and search engines on their first pass - sees no content at all.
 *
 * Runs after both builds: `vite build` for the client and `vite build --ssr`
 * for src/entry-server.tsx, which lands in dist-ssr/ and is deleted here.
 */
import { readFile, rm, writeFile } from "node:fs/promises";

const dist = new URL("../dist/", import.meta.url);
const ssr = new URL("../dist-ssr/", import.meta.url);

const { render, structuredData } = await import(new URL("entry-server.js", ssr).href);

const ROOT = '<div id="root"></div>';
const template = await readFile(new URL("index.html", dist), "utf8");
if (!template.includes(ROOT)) {
  throw new Error(`prerender: ${ROOT} not found in dist/index.html`);
}

const now = new Date();
// `<` escaped so no string in the data can close the script element early.
const jsonLd = JSON.stringify(structuredData(now)).replace(/</g, "\\u003c");

const html = template
  .replace(ROOT, `<div id="root">${await render()}</div>`)
  .replace("</head>", `  <script type="application/ld+json">${jsonLd}</script>\n  </head>`);

await writeFile(new URL("index.html", dist), html);

// The page changes on every deploy, so the deploy date is the honest lastmod.
const sitemapUrl = new URL("sitemap.xml", dist);
const sitemap = await readFile(sitemapUrl, "utf8");
await writeFile(
  sitemapUrl,
  sitemap.replace("</loc>", `</loc>\n    <lastmod>${now.toISOString().slice(0, 10)}</lastmod>`),
);

await rm(ssr, { recursive: true, force: true });

console.log(`prerender: dist/index.html ${(html.length / 1024).toFixed(1)} kB`);
