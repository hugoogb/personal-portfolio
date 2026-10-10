import { expect, test } from "@playwright/test";

// detect-gpu blocklists SwiftShader, so pin a manual quality; start in Story.
const STORY = JSON.stringify({ state: { mode: "story", qualityMode: "Low" }, version: 1 });

test.beforeEach(async ({ page }) => {
  await page.addInitScript((record) => {
    // Seed once per tab, so a choice made during the test survives a reload.
    if (sessionStorage.getItem("seeded")) return;
    localStorage.setItem("bc", record);
    sessionStorage.setItem("seeded", "1");
  }, STORY);
});

test("scrolling walks the tour: rail, hash and selection follow", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveClass(/mode-story/);
  await page.locator("#readledger").scrollIntoViewIfNeeded();
  await page.evaluate(() =>
    document.getElementById("readledger")!.scrollIntoView({ block: "center" }),
  );
  await expect(page.locator('[data-rail="rl"]')).toHaveAttribute("aria-current", "true");
  await expect(page).toHaveURL(/#readledger$/);
});

test("a rail dot scrolls to its section", async ({ page }) => {
  await page.goto("/");
  await page.locator('[data-rail="contact"]').click();
  await expect(page.locator('[data-rail="contact"]')).toHaveAttribute("aria-current", "true");
});

test("a resize keeps the current stop", async ({ page }) => {
  await page.goto("/#wrapped-things");
  await expect(page.locator('[data-rail="wt"]')).toHaveAttribute("aria-current", "true");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() =>
    document.getElementById("wrapped-things")!.scrollIntoView({ block: "center" }),
  );
  await expect(page.locator("[data-rail-label]")).toHaveText("Wrapped Things");
});

test("the camera travels to the project in view", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveClass(/town-ready/, { timeout: 20_000 });
  await page.evaluate(() =>
    document.getElementById("avatar-generator")!.scrollIntoView({ block: "center" }),
  );
  await expect
    .poll(async () => page.evaluate(() => window.__baseCamp?.camera().az ?? 0), { timeout: 5000 })
    .toBeGreaterThan(8);
});
