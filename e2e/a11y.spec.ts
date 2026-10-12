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
const STORY = JSON.stringify({ state: { mode: "story", qualityMode: "Low" }, version: 1 });

/** Seeds the saved record once per tab, so a choice made during the test survives a reload. */
const seed = (page: Page, record: string) =>
  page.addInitScript((r) => {
    if (sessionStorage.getItem("seeded")) return;
    localStorage.setItem("bc", r);
    sessionStorage.setItem("seeded", "1");
  }, record);

const ready = async (page: Page) => {
  await expect(page.locator("html")).toHaveClass(/town-ready/, { timeout: 20_000 });
  await expect(page.locator(".stage")).not.toHaveAttribute("inert", { timeout: 10_000 });
  // The town fades in over 0.6s (labels live inside it): axe reads a mid-fade label as faint text.
  await expect
    .poll(() => page.locator(".backdrop__town").evaluate((el) => getComputedStyle(el).opacity))
    .toBe("1");
};

/** Story keeps the HUD inert; the town is up once it has faded in. */
const townShown = async (page: Page) => {
  await expect(page.locator("html")).toHaveClass(/town-ready/, { timeout: 20_000 });
  await expect
    .poll(() => page.locator(".backdrop__town").evaluate((el) => getComputedStyle(el).opacity))
    .toBe("1");
};

/** One project Live and one Down, so the status pills are on the page for the scans. */
const statuses = (page: Page) =>
  page.route("**/api/status", (route) =>
    route.fulfill({
      json: {
        services: [
          { id: "rl", ok: true, ms: 40 },
          { id: "wt", ok: false, ms: null },
        ],
      },
    }),
  );

/** Barcelona noon and 23:00 on 10 Oct (CEST): the head script reads the clock for html.night. */
const CLOCKS = [
  ["day", "2026-10-10T10:00:00Z"],
  ["night", "2026-10-10T21:00:00Z"],
] as const;

/**
 * A pill's contrast against its card: the glass blended over the backdrop's own colour
 * (axe cannot read through the glass to the town, so it would only report "incomplete").
 */
const pillContrast = (page: Page, id: string) =>
  page.evaluate((place) => {
    const rgba = (c: string) => {
      const [r, g, b, a = 1] = c.match(/[\d.]+/g)!.map(Number);
      return { r, g, b, a };
    };
    const pill = document.querySelector<HTMLElement>(`[data-status-for="${place}"]`)!;
    const card = pill.closest(".story-card")!;
    const glass = rgba(getComputedStyle(card).backgroundColor);
    const under = rgba(getComputedStyle(document.getElementById("backdrop")!).backgroundColor);
    const mix = (k: "r" | "g" | "b") => glass[k] * glass.a + under[k] * (1 - glass.a);
    const lum = (c: { r: number; g: number; b: number }) => {
      const ch = (v: number) => {
        const x = v / 255;
        return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * ch(c.r) + 0.7152 * ch(c.g) + 0.0722 * ch(c.b);
    };
    const a = lum(rgba(getComputedStyle(pill).color));
    const b = lum({ r: mix("r"), g: mix("g"), b: mix("b") });
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  }, id);

/** Serious and critical only: those block people; the rest are logged for the report. */
const scan = async (page: Page, name: string, skip?: string) => {
  const axe = new AxeBuilder({ page }).exclude("canvas");
  if (skip) axe.exclude(skip);
  const { violations } = await axe.analyze();
  const blocking = violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  for (const v of violations)
    console.log(
      `[${name}] ${v.impact} ${v.id}: ${v.nodes.length} node(s) ${JSON.stringify(v.nodes[0]?.any[0]?.data)}`,
    );
  expect(
    blocking.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(" | ")}`),
  ).toEqual([]);
};

test.describe("Text mode", () => {
  test.beforeEach(async ({ page }) => {
    await seed(page, TEXT);
    await statuses(page);
  });
  for (const scheme of ["light", "dark"] as const) {
    test(`has no serious violations on a ${scheme} system theme`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme });
      await page.goto("/");
      await expect(page.locator("html")).toHaveClass(/mode-text/);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(page.getByRole("radiogroup", { name: "View" })).toBeVisible();
      await expect(page.locator('[data-status-for="rl"]')).toHaveText("Live");
      await expect(page.locator('[data-status-for="wt"]')).toHaveText("Down");
      await scan(page, `text-${scheme}`);
    });
  }
});

test.describe("Story", () => {
  test.beforeEach(async ({ page }) => seed(page, STORY));

  for (const [time, at] of CLOCKS) {
    test(`has no serious violations by ${time}, and the rail and switch are keyboard-reachable`, async ({
      page,
    }) => {
      // Pinned, so the scan is the same whatever hour the suite runs at.
      await page.clock.setFixedTime(new Date(at));
      await statuses(page);
      await page.goto("/");
      await expect(page.locator("html")).toHaveClass(/mode-story/);
      if (time === "night") await expect(page.locator("html")).toHaveClass(/(^|\s)night(\s|$)/);
      else await expect(page.locator("html")).not.toHaveClass(/(^|\s)night(\s|$)/);
      await townShown(page);
      await scan(page, `story-${time}`, "#explore-title");
      // The status pills sit on the cards' glass: at least 4.5:1 against it, day and night.
      for (const [id, text] of [
        ["rl", "Live"],
        ["wt", "Down"],
      ] as const) {
        await expect(page.locator(`[data-status-for="${id}"]`)).toHaveText(text);
        expect(await pillContrast(page, id), `${id} pill by ${time}`).toBeGreaterThanOrEqual(4.5);
      }
      // The finale text sits on the town, which axe cannot read from off screen: scan it in view too.
      await page.locator("#explore-title").scrollIntoViewIfNeeded();
      await scan(page, `story-finale-${time}`, "#top");
      await page.keyboard.press("Tab");
      await expect(page.locator(":focus")).toBeVisible();
      const rail = page.getByRole("navigation", { name: "Sections" });
      await expect(rail.getByRole("link")).toHaveCount(8);
      await expect(page.getByRole("radiogroup", { name: "View" })).toBeVisible();
    });
  }

  test("the current rail link is marked", async ({ page }) => {
    await page.goto("/#contact");
    await expect(page.locator('[data-rail="contact"]')).toHaveAttribute("aria-current", "true");
  });

  test("a rail dot is a 24px target", async ({ page }) => {
    await page.goto("/");
    const dots = page.locator("a.rail__dot");
    await expect(dots).toHaveCount(8);
    for (let i = 0; i < 8; i++) {
      const hit = await dots.nth(i).evaluate((el) => {
        const r = el.getBoundingClientRect();
        const cx = r.x + r.width / 2;
        const cy = r.y + r.height / 2;
        // The pseudo-element is part of the link's hit area: probe 11px off-centre.
        return {
          up: document.elementFromPoint(cx, cy - 11) === el,
          down: document.elementFromPoint(cx, cy + 11) === el,
          left: document.elementFromPoint(cx - 11, cy) === el,
        };
      });
      // A neighbour may own the shared edge; each side that is not a neighbour must be ours.
      expect(hit.left, `dot ${i} left`).toBe(true);
      expect(hit.up || i === 0, `dot ${i} up`).toBe(true);
      expect(hit.down || i === 7, `dot ${i} down`).toBe(true);
    }
  });

  test("the mode switch is one tab stop and the arrows move and select", async ({ page }) => {
    await page.goto("/");
    const radios = page.getByRole("radiogroup", { name: "View" }).getByRole("radio");
    await expect(radios).toHaveCount(3);
    await expect(radios.nth(0)).toHaveAttribute("tabindex", "0");
    await expect(radios.nth(1)).toHaveAttribute("tabindex", "-1");
    await expect(radios.nth(2)).toHaveAttribute("tabindex", "-1");
    await radios.nth(0).focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.locator("html")).toHaveClass(/mode-explore/);
    const explore = page.getByRole("radio", { name: "Explore" });
    await expect(explore).toBeFocused();
    await expect(explore).toHaveAttribute("aria-checked", "true");
    await expect(explore).toHaveAttribute("tabindex", "0");
    await page.keyboard.press("ArrowRight");
    await expect(page.locator("html")).toHaveClass(/mode-text/);
    await expect(page.getByRole("radio", { name: "Text" })).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(page.locator("html")).toHaveClass(/mode-story/);
    await expect(page.getByRole("radio", { name: "Story" })).toBeFocused();
    await page.keyboard.press("ArrowLeft");
    await expect(page.locator("html")).toHaveClass(/mode-text/);
  });
});

test.describe("Story with reduced motion", () => {
  test.use({ reducedMotion: "reduce" });
  test.beforeEach(async ({ page }) => seed(page, STORY));

  test("the camera cuts to each stop's pose, with nothing in between", async ({ page }) => {
    await page.goto("/");
    await townShown(page);
    type Pose = Record<"x" | "z" | "view" | "az", number>;
    // The azimuth is each stop's own (src/content/tour.ts); the rest is whatever the camera settles on.
    const finals: Pose[] = [];
    for (const [anchor, az] of [
      ["readledger", -12],
      ["esto-no-es-un-restaurante", -10],
    ] as const) {
      // Scroll, then sample the camera on every frame for 1.5s.
      const samples = await page.evaluate(
        async ([id, ms]) => {
          const cam = () =>
            (window as unknown as { __baseCamp: { camera(): Pose } }).__baseCamp.camera();
          const out = [cam()];
          document
            .getElementById(id as string)!
            .scrollIntoView({ block: "center", behavior: "instant" });
          const t0 = performance.now();
          while (performance.now() - t0 < (ms as number)) {
            await new Promise((r) => requestAnimationFrame(r));
            out.push(cam());
          }
          return out;
        },
        [anchor, 1500] as const,
      );
      const near = (a: Pose, b: Pose) =>
        (["x", "z", "view", "az"] as const).every((k) => Math.abs(a[k] - b[k]) < 0.01);
      const before = samples[0]!;
      const final = samples.at(-1)!;
      expect(Math.abs(final.az - az), `${anchor} az`).toBeLessThan(0.01);
      expect(near(before, final), `${anchor} moved`).toBe(false);
      const between = samples.filter((p) => !near(p, before) && !near(p, final));
      expect(between, `${anchor}: values between the two poses`).toEqual([]);
      finals.push(final);
    }
    expect(Math.abs(finals[0]!.x - finals[1]!.x)).toBeGreaterThan(1);
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
    // A place stays selected: its label has its own contrast to hold.
    await expect(page.locator(".place-label.is-selected")).toBeVisible();
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
    // A place stays selected: its label has its own contrast to hold.
    await expect(page.locator(".place-label.is-selected")).toBeVisible();
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
