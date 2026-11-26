/* global localStorage, document, window -- these run inside the page */
import { chromium } from "playwright-core";
import { mkdir, writeFile } from "node:fs/promises";

const { default: sharp } = await import(process.env.SHARP ?? "sharp");

const BASE = process.env.POSTER_URL ?? "http://localhost:4173/";
const MAX_BYTES = 60_000;
const AVIF_SHARE = 0.7;
const SHOTS = [
  { name: "wide", width: 1600, height: 1000 },
  { name: "tall", width: 600, height: 1100 },
];
const HOURS = { day: 13, night: 23 };
const SEED = JSON.stringify({
  state: { chosenMode: "story", qualityMode: "High", seen: true },
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
    await page.waitForTimeout(2500);
    const png = await page.screenshot({ type: "png" });
    const out = `public/posters/town-${when}-${shot.name}.webp`;
    let quality = 72;
    let webp = await sharp(png).webp({ quality, effort: 6 }).toBuffer();
    while (webp.length > MAX_BYTES && quality > 20) {
      quality -= 4;
      webp = await sharp(png).webp({ quality, effort: 6 }).toBuffer();
    }
    await writeFile(out, webp);
    let avifQuality = 60;
    let avif = await sharp(png).avif({ quality: avifQuality, effort: 9 }).toBuffer();
    while (avif.length > webp.length * AVIF_SHARE && avifQuality > 20) {
      avifQuality -= 5;
      avif = await sharp(png).avif({ quality: avifQuality, effort: 9 }).toBuffer();
    }
    await writeFile(out.replace(/\.webp$/, ".avif"), avif);
    console.log(
      `poster: ${out} ${webp.length} bytes, quality ${quality}; avif ${avif.length} bytes, quality ${avifQuality}`,
    );
    await page.close();
  }
}
await browser.close();
