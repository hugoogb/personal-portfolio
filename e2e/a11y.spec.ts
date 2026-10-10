import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const LOW = JSON.stringify({
  state: {
    discovered: [],
    achievements: [],
    hudMode: "auto",
    qualityMode: "Low",
    seen: true,
    mode: "explore",
  },
  version: 1,
});
const TEXT = JSON.stringify({ state: { mode: "text" }, version: 1 });

const ready = async (page: Page) => {
  await expect(page.locator("html")).toHaveClass(/town-ready/, { timeout: 20_000 });
  await expect(page.locator(".stage")).not.toHaveAttribute("inert", { timeout: 10_000 });
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

test.describe("Text mode", () => {
  test("has no serious violations", async ({ page }) => {
    await page.addInitScript((record) => localStorage.setItem("bc", record), TEXT);
    await page.goto("/");
    await expect(page.locator("html")).toHaveClass(/mode-text/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("radiogroup", { name: "View" })).toBeVisible();
    await scan(page, "text");
  });
});

test.describe("the town", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript((record) => localStorage.setItem("bc", record), LOW);
  });

  test("HUD, settings, trophies and console have no serious violations", async ({ page }) => {
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
    await expect(page.getByRole("dialog", { name: "Trophies" })).toBeVisible();
    await scan(page, "trophies");
    await page.keyboard.press("Escape");
    await page.keyboard.press("Control+k");
    await expect(page.getByRole("dialog", { name: "Console" })).toBeVisible();
    await expect(page.getByRole("combobox")).toBeVisible();
    await scan(page, "console");
    await page.keyboard.type("night");
    await page.keyboard.press("Enter");
    await page.keyboard.press("Escape");
    await expect(page.locator(".stage")).toHaveAttribute("data-hud", "dark");
    await scan(page, "hud-dark");
    await page.getByRole("button", { name: "Settings" }).click();
    await expect(page.getByRole("dialog", { name: "Settings" })).toBeVisible();
    await scan(page, "settings-dark");
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: "Trophies" }).click();
    await expect(page.getByRole("dialog", { name: "Trophies" })).toBeVisible();
    await scan(page, "trophies-dark");
  });

  test("the places list comes first after the top bar, the mode switch after it, and focus is always visible", async ({
    page,
  }) => {
    await page.goto("/");
    await ready(page);
    const seen: {
      inList: boolean;
      inTopBar: boolean;
      inSwitch: boolean;
      tag: string;
      focusVisible: boolean;
      outline: string;
    }[] = [];
    for (let i = 0; i < 60 && !seen.at(-1)?.inSwitch; i++) {
      await page.keyboard.press("Tab");
      seen.push(
        await page.evaluate(() => {
          const el = document.activeElement as HTMLElement;
          const style = getComputedStyle(el);
          return {
            inList: Boolean(el.closest('nav[aria-label="Places in town"]')),
            inTopBar: Boolean(el.closest("header.hud-top")),
            inSwitch: Boolean(el.closest('[role="radiogroup"][aria-label="View"]')),
            tag: el.tagName + (el.getAttribute("type") ? `[${el.getAttribute("type")}]` : ""),
            focusVisible: el.matches(":focus-visible"),
            outline: style.outlineStyle === "none" ? "" : style.outlineWidth,
          };
        }),
      );
    }
    const firstNotTopBar = seen.findIndex((s) => !s.inTopBar);
    expect(firstNotTopBar, "tabbing never left the top bar").toBeGreaterThanOrEqual(0);
    expect(seen[firstNotTopBar]?.inList).toBe(true);
    const lastInList = seen.map((s) => s.inList).lastIndexOf(true);
    const firstInSwitch = seen.findIndex((s) => s.inSwitch);
    expect(firstInSwitch, "tabbing never reached the mode switch").toBeGreaterThan(lastInList);
    for (const s of seen) {
      expect(s.focusVisible, JSON.stringify(s)).toBe(true);
      expect(parseFloat(s.outline), JSON.stringify(s)).toBeGreaterThan(0);
    }
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
