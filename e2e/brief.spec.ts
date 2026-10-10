import { expect, test } from "@playwright/test";
import { pageMetrics } from "./pageMetrics";

// These cover the Brief as the page. Reduced motion keeps every device on Lite,
// so the town never covers it (e2e/world.spec.ts covers the town).
test.use({ reducedMotion: "reduce" });

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

test("the HTML itself carries the whole Brief and the JSON-LD", async ({ request }) => {
  const html = await (await request.get("/")).text();
  for (const name of PROJECTS) expect(html, name).toContain(name);
  expect(html).toContain("mailto:hello@hugoogb.dev");
  const ld = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s);
  expect(ld).not.toBeNull();
  const data = JSON.parse(ld![1]);
  expect(JSON.stringify(data)).toContain("Hugo García Benjumea");
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
  for (const hash of ["about", "work", "stack", "contact", "readledger", "f1-tracker"]) {
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

  test("the Brief is complete", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    for (const name of PROJECTS) {
      await expect(page.getByRole("heading", { level: 3, name: new RegExp(name) })).toBeVisible();
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

test("reduced motion gets no 3D", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("canvas")).toHaveCount(0);
  await expect(page.locator("html")).not.toHaveClass(/can-world/);
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
