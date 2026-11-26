import { readFile, rm, writeFile } from "node:fs/promises";

const dist = new URL("../dist/", import.meta.url);
const ssr = new URL("../dist-ssr/", import.meta.url);

const { render, structuredData } = await import(new URL("entry-server.js", ssr).href);

const ROOT = '<div id="root"></div>';
const template = await readFile(new URL("index.html", dist), "utf8");
if (!template.includes(ROOT)) {
  throw new Error(`prerender: ${ROOT} not found in dist/index.html`);
}

const jsonLd = JSON.stringify(structuredData()).replace(/</g, "\\u003c");

const STYLESHEET = /<link rel="stylesheet" crossorigin href="\/(assets\/[^"]+\.css)">/;
const sheet = template.match(STYLESHEET);
if (!sheet) throw new Error("prerender: no stylesheet link in dist/index.html");
const css = await readFile(new URL(sheet[1], dist), "utf8");

const html = template
  .replace(sheet[0], () => `<style>${css}</style>`)
  .replace(ROOT, `<div id="root">${await render()}</div>`)
  .replace("</head>", `  <script type="application/ld+json">${jsonLd}</script>\n  </head>`);

await writeFile(new URL("index.html", dist), html);

await rm(ssr, { recursive: true, force: true });

console.log(`prerender: dist/index.html ${(html.length / 1024).toFixed(1)} kB`);
