import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const LOW = JSON.stringify({
  state: { discovered: [], achievements: [], hudMode: "auto", qualityMode: "Low", seen: true },
  version: 1,
});

const ready = async (page: Page) => {
  await expect(page.locator("html")).toHaveClass(/world-ready/, { timeout: 20_000 });
  await expect(page.locator(".stage")).not.toHaveAttribute("inert", { timeout: 10_000 });
  await expect(page.locator(".title-card")).toBeHidden();
};

/** Serious and critical only: those block people; the rest are logged for the report. */
const scan = async (page: Page, name: string) => {
  const { violations } = await new AxeBuilder({ page }).exclude("canvas").analyze();
  const blocking = violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  for (const v of violations)
    console.log(`[${name}] ${v.impact} ${v.id}: ${v.nodes.length} node(s)`);
  expect(
    blocking.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(" | ")}`),
  ).toEqual([]);
};

test.describe("the Brief", () => {
  test.use({ reducedMotion: "reduce" });
  test("has no serious violations", async ({ page }) => {
    await page.goto("/");
    await scan(page, "brief");
  });
});

test.describe("the town", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript((record) => localStorage.setItem("bc", record), LOW);
  });

  test("HUD, settings, trophies, console and Brief overlay have no serious violations", async ({
    page,
  }) => {
    await page.goto("/");
    await ready(page);
    // Force each HUD theme: the preview console's day/night commands.
    await page.keyboard.press("Control+k");
    await page.keyboard.type("day");
    await page.keyboard.press("Enter");
    await page.keyboard.press("Escape");
    await expect(page.locator(".stage")).toHaveAttribute("data-hud", "light");
    await scan(page, "hud-light");
    await page.getByRole("button", { name: "Settings" }).click();
    await expect(page.getByRole("dialog", { name: "Settings" })).toBeVisible();
    await scan(page, "settings");
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: "Trophies" }).click();
    await scan(page, "trophies");
    await page.keyboard.press("Escape");
    await page.keyboard.press("Control+k");
    await scan(page, "console");
    await page.keyboard.type("night");
    await page.keyboard.press("Enter");
    await page.keyboard.press("Escape");
    await expect(page.locator(".stage")).toHaveAttribute("data-hud", "dark");
    await scan(page, "hud-dark");
    await page.getByRole("button", { name: "Settings" }).click();
    await scan(page, "settings-dark");
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: "Trophies" }).click();
    await scan(page, "trophies-dark");
    await page.keyboard.press("Escape");
    await page.keyboard.press("b");
    await scan(page, "brief-overlay");
  });

  test("the places list comes first after the top bar, and focus is always visible", async ({
    page,
  }) => {
    await page.goto("/");
    await ready(page);
    const seen: { inList: boolean; inTopBar: boolean; outline: string; shadow: string }[] = [];
    for (let i = 0; i < 14; i++) {
      await page.keyboard.press("Tab");
      seen.push(
        await page.evaluate(() => {
          const el = document.activeElement as HTMLElement;
          const style = getComputedStyle(el);
          return {
            inList: Boolean(el.closest('nav[aria-label="Places in town"]')),
            inTopBar: Boolean(el.closest("header.hud-top")),
            outline: style.outlineStyle === "none" ? "" : style.outlineWidth,
            shadow: style.boxShadow === "none" ? "" : style.boxShadow,
          };
        }),
      );
    }
    const firstNotTopBar = seen.findIndex((s) => !s.inTopBar);
    expect(seen[firstNotTopBar]?.inList).toBe(true);
    for (const s of seen) expect(s.outline || s.shadow, JSON.stringify(s)).toBeTruthy();
  });

  test("dialogs trap focus and give it back on Esc", async ({ page }) => {
    await page.goto("/");
    await ready(page);
    const opener = page.getByRole("button", { name: "Settings" });
    await opener.click();
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press("Tab");
      expect(
        await page.evaluate(() => Boolean(document.activeElement?.closest("[role=dialog]"))),
      ).toBe(true);
    }
    await page.keyboard.press("Escape");
    await expect(opener).toBeFocused();
  });
});
