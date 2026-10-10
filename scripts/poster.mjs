/* global localStorage, document, window -- these run inside the page */
/**
 * Captures the still images of the town that Story shows before the canvas is
 * ready (spec 6.1). Run after a visual change to the town:
 *   pnpm build && pnpm preview --port 4173 --strictPort &
 *   npm i --no-save --prefix /private/tmp/claude-501/poster sharp@0.34.4
 *   SHARP=/private/tmp/claude-501/poster/node_modules/sharp/lib/index.js node scripts/poster.mjs
 * sharp is not a project dependency; it comes from that scratch install.
 * Needs no GPU: SwiftShader draws it, slowly. The images are committed, each
 * at most 60000 bytes (spec 8): the webp quality steps down from 72 until it fits.
 */
import { chromium } from "playwright-core";
import { mkdir, writeFile } from "node:fs/promises";

const { default: sharp } = await import(process.env.SHARP ?? "sharp");

const BASE = process.env.POSTER_URL ?? "http://localhost:4173/";
const MAX_BYTES = 60_000;
const SHOTS = [
  { name: "wide", width: 1600, height: 1000 },
  { name: "tall", width: 600, height: 1100 },
];
const HOURS = { day: 13, night: 23 };
const SEED = JSON.stringify({
  state: { mode: "story", qualityMode: "High", seen: true },
  version: 1,
});

await mkdir("public/posters", { recursive: true });
const browser = await chromium.launch({
  args: ["--enable-unsafe-swiftshader", "--use-angle=swiftshader", "--ignore-gpu-blocklist"],
});
for (const shot of SHOTS) {
  for (const [when, hour] of Object.entries(HOURS)) {
    const page = await browser.newPage({
      viewport: { width: shot.width, height: shot.height },
      deviceScaleFactor: 1,
    });
    await page.addInitScript((seed) => localStorage.setItem("bc", seed), SEED);
    await page.goto(BASE);
    await page.waitForFunction(
      () => document.documentElement.classList.contains("town-ready"),
      null,
      { timeout: 60_000 },
    );
    await page.evaluate((h) => window.__baseCamp.setHour(h), hour);
    await page.addStyleTag({
      content: "#story,#rail,.mode-switch,.backdrop__still{visibility:hidden!important}",
    });
    await page.waitForTimeout(2500); // the camera settles on the landing pose, day/night eases
    const png = await page.screenshot({ type: "png" });
    const out = `public/posters/town-${when}-${shot.name}.webp`;
    let quality = 72;
    let webp = await sharp(png).webp({ quality, effort: 6 }).toBuffer();
    while (webp.length > MAX_BYTES && quality > 20) {
      quality -= 4;
      webp = await sharp(png).webp({ quality, effort: 6 }).toBuffer();
    }
    await writeFile(out, webp);
    console.log(`poster: ${out} ${webp.length} bytes, quality ${quality}`);
    await page.close();
  }
}
await browser.close();
