import { expect, test, type Page } from "@playwright/test";

// Switching between Story, Explore and Text keeps the visitor's place, and only an explicit
// choice is remembered. detect-gpu blocklists SwiftShader, so every seed pins a manual quality.
const record = (state: object) =>
  JSON.stringify({ state: { qualityMode: "Low", ...state }, version: 1 });
const STORY = record({ mode: "story" });
const TEXT = record({ mode: "text" });
const EXPLORE = record({ mode: "explore", seen: true });

/** Seeds the saved record once per tab, so a choice made during the test survives a reload. */
const seed = (page: Page, value: string) =>
  page.addInitScript((r) => {
    if (sessionStorage.getItem("seeded")) return;
    localStorage.setItem("bc", r);
    sessionStorage.setItem("seeded", "1");
  }, value);

const saved = (page: Page) =>
  page.evaluate(() => JSON.parse(localStorage.getItem("bc") ?? "{}").state ?? {});

const townReady = (page: Page) =>
  expect(page.locator("html")).toHaveClass(/town-ready/, { timeout: 20_000 });

/** Explore takes keys once the build-in is over. */
const exploreReady = async (page: Page) => {
  await expect(page.locator("html")).toHaveClass(/mode-explore/);
  await townReady(page);
  await expect(page.locator(".stage")).not.toHaveAttribute("inert", { timeout: 10_000 });
};

const pick = (page: Page, name: "Story" | "Explore" | "Text") =>
  page.getByRole("radio", { name }).click();

const centre = (page: Page, id: string) =>
  page.evaluate(
    (anchor) =>
      document.getElementById(anchor)!.scrollIntoView({ block: "center", behavior: "instant" }),
    id,
  );

/** Every URL the page writes with replaceState, from now on. */
const recordUrls = (page: Page) =>
  page.evaluate(() => {
    const w = window as unknown as { __urls: string[] };
    w.__urls = [];
    const replace = history.replaceState.bind(history);
    history.replaceState = (data, unused, url) => {
      w.__urls.push(String(url));
      replace(data, unused, url);
    };
  });
const urls = (page: Page) =>
  page.evaluate(() => (window as unknown as { __urls: string[] }).__urls);

test.describe("what is remembered", () => {
  test.beforeEach(({ page }) => seed(page, STORY));

  test("a hash link doesn't change the saved mode", async ({ page }) => {
    await page.goto("/#stadium");
    await expect(page.locator("html")).toHaveClass(/mode-explore/);
    await expect.poll(async () => (await saved(page)).chosenMode).toBe("story");
    await page.goto("/");
    await expect(page.locator("html")).toHaveClass(/mode-story/);
    await page.goto("/#text");
    await expect(page.locator("html")).toHaveClass(/mode-text/);
    await page.goto("/");
    await expect(page.locator("html")).toHaveClass(/mode-story/);
  });

  test("a choice in the switch is remembered", async ({ page }) => {
    await page.goto("/");
    await pick(page, "Text");
    await expect.poll(async () => (await saved(page)).chosenMode).toBe("text");
    await page.reload();
    await expect(page.locator("html")).toHaveClass(/mode-text/);
  });
});

test.describe("a default the visitor never chose", () => {
  test("reduced motion starts in Text without saving Text", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.locator("html")).toHaveClass(/mode-text/);
    // The status poll writes the record on boot: it must not carry Text as a choice.
    await expect.poll(() => page.evaluate(() => localStorage.getItem("bc"))).not.toBeNull();
    expect((await saved(page)).chosenMode ?? null).toBeNull();
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.reload();
    await expect(page.locator("html")).toHaveClass(/mode-story/);
  });
});

test.describe("switching keeps the place", () => {
  test.describe("from Story", () => {
    test.beforeEach(({ page }) => seed(page, STORY));

    test("Explore and back with Esc returns to the same spot, flying past nothing", async ({
      page,
    }) => {
      await page.goto("/#wrapped-things");
      await expect(page.locator('[data-rail="wt"]')).toHaveAttribute("aria-current", "true");
      await townReady(page);
      const y = await page.evaluate(() => window.scrollY);
      expect(y).toBeGreaterThan(0);
      await pick(page, "Explore");
      await exploreReady(page);
      await recordUrls(page);
      await page.keyboard.press("Escape");
      await expect(page.locator("html")).toHaveClass(/mode-story/);
      // Long enough for any smooth scroll to have flown past the earlier stops.
      await page.waitForTimeout(1500);
      const written = await urls(page);
      expect(written.filter((u) => /#(about|f1-tracker|readledger)$/.test(u))).toEqual([]);
      await expect(page).toHaveURL(/#wrapped-things$/);
      await expect(page.locator('[data-rail="wt"]')).toHaveAttribute("aria-current", "true");
      expect(Math.abs((await page.evaluate(() => window.scrollY)) - y)).toBeLessThanOrEqual(2);
    });

    test("Text keeps the section", async ({ page }) => {
      await page.goto("/#wrapped-things");
      await expect(page.locator('[data-rail="wt"]')).toHaveAttribute("aria-current", "true");
      await pick(page, "Text");
      await expect(page.locator("html")).toHaveClass(/mode-text/);
      await expect(page.locator("#wrapped-things h2")).toBeInViewport();
    });
  });

  test.describe("from Text", () => {
    test.beforeEach(({ page }) => seed(page, TEXT));

    test("Story lands on the section read in Text", async ({ page }) => {
      await page.goto("/");
      await expect(page.locator("html")).toHaveClass(/mode-text/);
      await centre(page, "contact");
      await pick(page, "Story");
      await expect(page.locator("html")).toHaveClass(/mode-story/);
      // Long enough for a scroll to an old stop to have moved the page.
      await page.waitForTimeout(1500);
      await expect(page.locator('[data-rail="contact"]')).toHaveAttribute("aria-current", "true");
      await expect(page).toHaveURL(/#contact$/);
      await expect(page.locator("#contact h2")).toBeInViewport();
    });

    test("Explore selects the project read in Text", async ({ page }) => {
      await page.goto("/");
      await centre(page, "readledger");
      await pick(page, "Explore");
      await exploreReady(page);
      await expect(page.getByRole("heading", { level: 2, name: "ReadLedger" })).toBeVisible();
    });
  });

  test.describe("from Explore", () => {
    test.beforeEach(({ page }) => seed(page, STORY));

    test("Text lands on the selected place's section", async ({ page }) => {
      await page.goto("/#esto-no-es-un-restaurante");
      await townReady(page);
      await pick(page, "Explore");
      await exploreReady(page);
      await expect(
        page.getByRole("heading", { level: 2, name: "Esto no es un restaurante" }),
      ).toBeVisible();
      await pick(page, "Text");
      await expect(page.locator("html")).toHaveClass(/mode-text/);
      await expect(page.locator("#esto-no-es-un-restaurante h2")).toBeInViewport();
    });
  });
});

test.describe("the phone chip", () => {
  test.use({ viewport: { width: 390, height: 844 } });
  test.beforeEach(({ page }) => seed(page, STORY));

  test("closes on a pick, a tap outside and Esc, and marks the current stop", async ({ page }) => {
    await page.goto("/");
    const chip = page.locator("#rail-chip");
    const summary = chip.locator("summary");
    await expect(summary).toBeVisible();
    await summary.click();
    await expect(chip).toHaveAttribute("open", "");
    await chip.locator('[data-rail-chip="rl"]').click();
    await expect(chip).not.toHaveAttribute("open");
    await expect(chip.locator('[data-rail-chip="rl"]')).toHaveAttribute("aria-current", "true");
    await expect(chip.locator('[aria-current="true"]')).toHaveCount(1);
    await summary.click();
    await expect(chip).toHaveAttribute("open", "");
    await page.mouse.click(30, 420);
    await expect(chip).not.toHaveAttribute("open");
    await summary.click();
    await expect(chip).toHaveAttribute("open", "");
    await page.keyboard.press("Escape");
    await expect(chip).not.toHaveAttribute("open");
    await expect(summary).toBeFocused();
  });
});

test.describe("print is always Text", () => {
  const printed = async (page: Page) => {
    await page.emulateMedia({ media: "print" });
    await expect(page.locator("#backdrop")).toBeHidden();
    await expect(page.locator(".mode-switch")).toBeHidden();
    await expect(page.locator("#rail")).toBeHidden();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator("#readledger h2")).toBeVisible();
    await expect(page.locator("#contact h2")).toBeVisible();
  };

  test("from Explore, without the HUD", async ({ page }) => {
    await seed(page, EXPLORE);
    await page.goto("/");
    await exploreReady(page);
    await expect(page.locator(".stage")).toBeVisible();
    await printed(page);
    await expect(page.locator(".stage")).toBeHidden();
  });

  test("from Story", async ({ page }) => {
    await seed(page, STORY);
    await page.goto("/");
    await townReady(page);
    await printed(page);
  });
});

test.describe("after the town failed this session", () => {
  test.beforeEach(async ({ page }) => {
    await seed(page, STORY);
    await page.addInitScript(() => sessionStorage.setItem("bc-town-failed", "1"));
  });

  test("Story stays on the still image, and the finale says why Explore is off", async ({
    page,
  }) => {
    const town: string[] = [];
    page.on("request", (r) => /World-|lighting-/.test(r.url()) && town.push(r.url()));
    await page.goto("/");
    await expect(page.locator("html")).toHaveClass(/mode-story/);
    await expect(page.getByRole("radio", { name: "Explore" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    await centre(page, "explore");
    const cta = page.getByRole("button", { name: /Explore the town/ });
    await expect(cta).toBeDisabled();
    await expect(page.locator("#explore-why")).toBeVisible();
    await expect(page.locator("#explore-why")).toHaveText("Your browser can't draw the 3D town");
    await expect(cta).toHaveAccessibleDescription("Your browser can't draw the 3D town");
    expect(town).toEqual([]);
  });
});
