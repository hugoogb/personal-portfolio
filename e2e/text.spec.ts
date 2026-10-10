import { expect, test } from "@playwright/test";
import { pageMetrics } from "./pageMetrics";

// These cover the story document as the page, in Text mode. The town and the
// tour are covered elsewhere.
const TEXT = JSON.stringify({ state: { mode: "text" }, version: 1 });

test.beforeEach(async ({ page }) => {
  await page.addInitScript((record) => {
    // Seed once per tab, so a choice made during the test survives a reload.
    if (sessionStorage.getItem("seeded")) return;
    localStorage.setItem("bc", record);
    sessionStorage.setItem("seeded", "1");
  }, TEXT);
});

const PROJECTS = [
  "F1 Tracker",
  "ReadLedger",
  "Wrapped Things",
  "Esto no es un restaurante",
  "@avatar-generator",
];

// Vercel's Speed Insights script only exists on Vercel; under `vite preview` it 404s.
// A failed load's message omits the URL, so match on where it came from.
const isNoise = (url: string) => url.includes("/_vercel/");

test("the HTML itself carries the whole page and the JSON-LD", async ({ request }) => {
  const html = await (await request.get("/")).text();
  expect(html).toContain("<h1");
  for (const name of PROJECTS) expect(html, name).toContain(name);
  expect(html).toContain("hello@hugoogb.dev");
  expect(html).toContain('id="rail"');
  expect(html).toContain("application/ld+json");
  const ld = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s);
  expect(ld).not.toBeNull();
  expect(JSON.stringify(JSON.parse(ld![1]))).toContain("Hugo García Benjumea");
});

test("loads without console errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error" && !isNoise(msg.location().url)) errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(err.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Hugo García Benjumea");
  expect(errors).toEqual([]);
});

test("links into the site still land", async ({ page }) => {
  for (const hash of ["about", "contact", "readledger", "f1-tracker"]) {
    // Each link arrives from outside, so start from a fresh load: a same-page hash
    // change issued mid smooth-scroll is a different case, and headless Chromium
    // drops it.
    await page.goto("about:blank");
    await page.goto(`/#${hash}`);
    await expect(page.locator(`#${hash}`), hash).toBeInViewport();
  }
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("the page is complete", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    for (const name of PROJECTS) {
      await expect(page.getByRole("heading", { level: 2, name: new RegExp(name) })).toBeVisible();
    }
    await expect(page.getByRole("link", { name: "hello@hugoogb.dev" })).toBeVisible();
  });
});

for (const width of [320, 390]) {
  test(`never scrolls sideways at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
}

test.describe("reduced motion", () => {
  // No seed here: the preference alone must choose Text.
  test("starts in Text and loads no town code", async ({ page }) => {
    await page.addInitScript(() => localStorage.removeItem("bc"));
    await page.emulateMedia({ reducedMotion: "reduce" });
    const requests: string[] = [];
    page.on("request", (req) => requests.push(req.url()));
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("html")).toHaveClass(/mode-text/);
    expect(requests.filter((u) => /World-|lighting-/.test(u))).toEqual([]);
  });
});

test("garbage in storage never breaks the page", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("color", "javascript:alert(1)");
    localStorage.setItem("bc", "{oops");
    localStorage.setItem("isDarkMode", "true");
  });
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(err.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  const accent = await page.evaluate(() =>
    document.documentElement.style.getPropertyValue("--primary-color"),
  );
  expect(accent).toBe("");
  expect(errors).toEqual([]);
});

test("a saved accent is painted before the page renders", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("color", "#10b981"));
  await page.goto("/");
  const accent = await page.evaluate(() =>
    document.documentElement.style.getPropertyValue("--primary-color"),
  );
  expect(accent).toBe("#10b981");
});

test("the largest paint is text, and nothing shifts", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  const { lcpTag, lcpUrl, cls, shifts } = await pageMetrics(page);
  expect(["H1", "H2", "P", "DIV", "SPAN"]).toContain(lcpTag);
  expect(lcpUrl).toBe("");
  expect(cls, `shifted: ${shifts.join(",")}`).toBe(0);
});
