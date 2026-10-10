import { expect, test, type Page } from "@playwright/test";
import { pageMetrics } from "./pageMetrics";

// detect-gpu blocklists SwiftShader, so pin a manual quality: the town then
// loads on any WebGL context. These tests drive the HUD, so they start in Explore.
const LOW = JSON.stringify({
  state: {
    discovered: [],
    achievements: [],
    hudMode: "auto",
    qualityMode: "Low",
    seen: false,
    mode: "explore",
  },
  version: 1,
});

const isNoise = (url: string) => url.includes("/_vercel/");

test.beforeEach(async ({ page }) => {
  await page.addInitScript((record) => {
    // Seed once per tab, so a choice made during the test survives a reload.
    if (sessionStorage.getItem("seeded")) return;
    localStorage.setItem("bc", record);
    sessionStorage.setItem("seeded", "1");
  }, LOW);
});

const ready = async (page: Page) => {
  await expect(page.locator("html")).toHaveClass(/town-ready/, { timeout: 20_000 });
  await expect(page.locator(".stage")).not.toHaveAttribute("inert", { timeout: 10_000 });
};
const canvas = (page: Page) => page.locator("#town-root canvas");
const card = (page: Page, name: string) => page.getByRole("heading", { level: 2, name });

/** Counts the distinct colours in a PNG, so a blank or uniform canvas shows up as one. */
const colours = (page: Page, png: Buffer) =>
  page.evaluate(async (b64) => {
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const bmp = await createImageBitmap(new Blob([bytes], { type: "image/png" }));
    const c = new OffscreenCanvas(bmp.width, bmp.height);
    const ctx = c.getContext("2d")!;
    ctx.drawImage(bmp, 0, 0);
    const d = ctx.getImageData(0, 0, bmp.width, bmp.height).data;
    const seen = new Set<number>();
    for (let i = 0; i < d.length; i += 4 * 97) seen.add((d[i] << 16) | (d[i + 1] << 8) | d[i + 2]);
    return seen.size;
  }, png.toString("base64"));

test("the town mounts without console errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error" && !isNoise(m.location().url)) errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await ready(page);
  await expect(canvas(page)).toBeVisible();
  await expect(card(page, "Headquarters")).toBeVisible();
  await expect(page.locator(".hud-name")).toHaveText("Hugo García Benjumea");
  expect(errors).toEqual([]);
});

test("/#readledger selects ReadLedger, with its screenshot", async ({ page }) => {
  await page.goto("/#readledger");
  await ready(page);
  await expect(card(page, "ReadLedger")).toBeVisible();
  // The story document stays in the DOM under the town, so scope to the card.
  const shot = page.getByRole("region", { name: "ReadLedger, Service" });
  await expect(shot.getByRole("img", { name: "Screenshot of ReadLedger" })).toBeVisible();
});

test("the arrow keys cycle and Esc deselects", async ({ page }) => {
  await page.goto("/");
  await ready(page);
  await page.keyboard.press("ArrowRight");
  await expect(card(page, "F1 Tracker")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByText("Click a place to inspect it")).toBeVisible();
});

test("clicking a place selects it, a drag that ends on it does not, and clicking empty space deselects", async ({
  page,
}) => {
  await page.goto("/");
  await ready(page);
  await page.keyboard.press("Escape");
  const hint = page.getByText("Click a place to inspect it");
  await expect(hint).toBeVisible();
  const box = (await canvas(page).boundingBox())!;
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;

  await page.mouse.click(cx, cy);
  await expect(card(page, "Headquarters")).toBeVisible();

  // The ground follows the pointer in a pan, so a drag that starts over HQ ends
  // over HQ. It must not count as a click: pressing Esc first, nothing is selected.
  await page.keyboard.press("Escape");
  await expect(hint).toBeVisible();
  await page.mouse.move(cx, cy);
  await page.mouse.down();
  await page.mouse.move(cx + 40, cy, { steps: 8 });
  await page.mouse.up();
  await expect(hint).toBeVisible();
  // Control: a plain click on that same spot does select HQ, so the drag guard is what held it back.
  await page.mouse.click(cx + 40, cy);
  await expect(card(page, "Headquarters")).toBeVisible();

  // Zoomed all the way out, only sky or sea is left in the corner.
  await page.mouse.move(cx, cy);
  for (let i = 0; i < 6; i++) await page.mouse.wheel(0, 2000);
  // Selection survives zooming. The camera eases over about 0.5s, so let it settle.
  await expect(card(page, "Headquarters")).toBeVisible();
  await page.waitForTimeout(600);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.mouse.click(box.x + 10, box.y + 10);
  await expect(hint).toBeVisible();
});

test("the console runs commands and unlocks Operator", async ({ page }) => {
  await page.goto("/");
  await ready(page);
  await page.keyboard.press("Control+k");
  await page.keyboard.type("go post");
  await page.keyboard.press("Enter");
  await expect(card(page, "Post Office")).toBeVisible();
  await expect(page.getByText("Achievement unlocked · Operator")).toBeVisible();
});

test("Lite keeps the story on the still image, and Explore turns the town back on", async ({
  page,
}) => {
  await page.goto("/");
  await ready(page);
  await page.getByRole("button", { name: "Settings" }).click();
  // Picking Lite removes the radio itself, so check() cannot confirm its state; click it.
  await page.getByRole("radio", { name: "Lite" }).click();
  const html = page.locator("html");
  await expect(html).toHaveClass(/mode-story/);
  await expect(html).not.toHaveClass(/town-ready/);
  await expect(page.locator(".stage")).toHaveCount(0);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  // Lite is the visitor's choice, not a device that cannot draw: Explore stays open and says so.
  const explore = page.getByRole("radio", { name: /Explore/ });
  await expect(explore).not.toHaveAttribute("aria-disabled");
  await expect(explore).toHaveAttribute(
    "title",
    "3D is off (Lite) - choose Explore to turn it back on",
  );
  await explore.click();
  await ready(page);
  await expect(card(page, "Headquarters")).toBeVisible();
  await expect(html).toHaveClass(/mode-explore/);
});

test("the mode switch moves between Explore, Story and Text", async ({ page }) => {
  await page.goto("/");
  await ready(page);
  const html = page.locator("html");
  await page.getByRole("radio", { name: "Story" }).click();
  await expect(html).toHaveClass(/mode-story/);
  await expect(page.locator(".stage")).toHaveCount(0);
  await expect(canvas(page)).toBeVisible();
  await page.getByRole("radio", { name: "Text" }).click();
  await expect(html).toHaveClass(/mode-text/);
  await expect(canvas(page)).toHaveCount(0);
  // Straight from Text: the town loads at once, and the HUD waits for its first frame.
  await page.getByRole("radio", { name: "Explore" }).click();
  await expect(html).toHaveClass(/mode-explore/);
  await ready(page);
  await expect(card(page, "Headquarters")).toBeVisible();
});

test.describe("on a phone", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test("a bottom sheet, no minimap, no sideways scroll, no clipped labels", async ({ page }) => {
    await page.goto("/#contact");
    await ready(page);
    await expect(card(page, "Post Office")).toBeVisible();
    await expect(page.locator(".minimap")).toBeHidden();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
    const clipped = await page.$$eval(".cmd span", (spans) =>
      spans.filter((s) => s.scrollWidth > s.clientWidth + 1).map((s) => s.textContent),
    );
    expect(clipped).toEqual([]);
    await page.getByRole("button", { name: "Details" }).click();
    await expect(page.locator(".card__desc")).toContainText("hello@hugoogb.dev");
  });
});

test("a device without WebGL2 lands in Text", async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type: string,
      ...rest: unknown[]
    ) {
      if (type === "webgl2") return null;
      return (original as (...a: unknown[]) => unknown).call(this, type, ...rest);
    } as typeof original;
  });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "Hugo García Benjumea" })).toBeVisible({
    timeout: 20_000,
  });
  await expect(page.locator("html")).toHaveClass(/mode-text/);
  await expect(page.locator("html")).not.toHaveClass(/town-ready/);
});

test("the preview night command darkens the town and the HUD", async ({ page }) => {
  await page.goto("/");
  await ready(page);
  await expect(page.locator(".stage")).toHaveAttribute("data-hud", /light|dark/);
  await page.keyboard.press("Control+k");
  await page.keyboard.type("night");
  await page.keyboard.press("Enter");
  await expect(page.locator(".stage")).toHaveAttribute("data-hud", "dark");
  await page.keyboard.press("Control+k");
  await page.keyboard.type("day");
  await page.keyboard.press("Enter");
  await expect(page.locator(".stage")).toHaveAttribute("data-hud", "light");
});

test("driving: keys move the car, Esc leaves and frames the arena", async ({ page }) => {
  await page.goto("/#arena");
  await ready(page);
  await page.getByRole("button", { name: /Take the wheel/ }).click();
  await expect(page.getByRole("region", { name: "Driving" })).toBeVisible();
  await page.keyboard.down("w");
  await page.waitForTimeout(600);
  await page.keyboard.up("w");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("region", { name: "Driving" })).toHaveCount(0);
  await expect(page.getByRole("heading", { level: 2, name: "The Arena" })).toBeVisible();
});

test("the stadium wave runs from its card", async ({ page }) => {
  await page.goto("/#stadium");
  await ready(page);
  await page.getByRole("button", { name: /Start a wave/ }).click();
  await expect(page.getByText("Wave started in the stands")).toBeVisible();
});

test("a down service shows Down on its card and the top bar counts only what is up", async ({
  page,
}) => {
  await page.route("**/api/status", (route) =>
    route.fulfill({
      json: {
        checkedAt: "x",
        services: [
          { id: "f1", host: "f1-tracker.hugoogb.dev", ok: true, status: 200, ms: 120 },
          { id: "rl", host: "readledger.app", ok: false, status: 0, ms: null },
          { id: "wt", host: "wrappedthings.app", ok: true, status: 200, ms: 90 },
          { id: "es", host: "estonoesunrestaurante.com", ok: true, status: 200, ms: 80 },
          { id: "av", host: "avatar-generator.hugoogb.dev", ok: true, status: 200, ms: 60 },
        ],
      },
    }),
  );
  await page.goto("/#readledger");
  await ready(page);
  await expect(
    page.getByRole("region", { name: "ReadLedger, Service" }).getByText("Down", { exact: true }),
  ).toBeVisible();
  await expect(page.getByTitle("Projects confirmed live")).toContainText("4/5");
});

test.describe("on High", () => {
  const HIGH = JSON.stringify({
    state: { qualityMode: "High", seen: true, mode: "explore" },
    version: 1,
  });

  test("a failed effects chunk leaves the town running", async ({ page }) => {
    await page.addInitScript((record) => localStorage.setItem("bc", record), HIGH);
    let requested = 0;
    await page.route("**/assets/Effects-*.js", (route) => {
      requested += 1;
      return route.abort();
    });
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/");
    await ready(page);
    await expect(card(page, "Headquarters")).toBeVisible();
    await page.keyboard.press("ArrowRight");
    await expect(card(page, "F1 Tracker")).toBeVisible();
    // The chunk was really requested and blocked. The boundary caught the failure; R3F's
    // onCaughtError reports caught errors through reportError, so exactly one pageerror shows.
    expect(requested).toBeGreaterThan(0);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain("dynamically imported module");
  });

  test("the effects mount and run clean, and dropping to Medium keeps the town drawing", async ({
    page,
  }) => {
    await page.addInitScript((record) => localStorage.setItem("bc", record), HIGH);
    const errors: string[] = [];
    page.on("console", (m) => {
      if (m.type() === "error" && !isNoise(m.location().url)) errors.push(m.text());
    });
    page.on("pageerror", (e) => errors.push(e.message));
    const chunk = page.waitForResponse(/\/assets\/Effects-.*\.js/);
    await page.goto("/");
    await ready(page);
    // The chunk really loaded (a High town that never mounted the composer would not fetch it).
    expect((await chunk).ok()).toBe(true);
    await page.waitForTimeout(1_000);
    expect(errors).toEqual([]);
    expect(await colours(page, await canvas(page).screenshot())).toBeGreaterThan(20);

    await page.getByRole("button", { name: "Settings" }).click();
    await page.getByRole("radio", { name: "Medium" }).check();
    await page.keyboard.press("Escape");
    await page.waitForTimeout(1_000);
    expect(errors).toEqual([]);
    expect(await colours(page, await canvas(page).screenshot())).toBeGreaterThan(20);
    await page.keyboard.press("ArrowRight");
    await expect(card(page, "F1 Tracker")).toBeVisible();
  });
});

test("on Medium, a running frame stays in the draw-call budget and shadows keep updating", async ({
  page,
}) => {
  const MEDIUM = JSON.stringify({
    state: { qualityMode: "Medium", seen: true, mode: "explore" },
    version: 1,
  });
  await page.addInitScript((record) => localStorage.setItem("bc", record), MEDIUM);
  await page.goto("/");
  await ready(page);
  await page.waitForTimeout(1_000);
  // The shadow map is drawn every other frame, so frames alternate between the main
  // pass alone and the main pass plus the shadow pass (spec 10: 250 + 60 calls).
  const calls: number[] = [];
  for (let i = 0; i < 24; i++) {
    calls.push(await page.evaluate(() => window.__baseCamp?.info().calls ?? 0));
    await page.waitForTimeout(37);
  }
  expect(Math.min(...calls)).toBeGreaterThan(0);
  expect(Math.min(...calls)).toBeLessThanOrEqual(250);
  expect(Math.max(...calls)).toBeLessThanOrEqual(310);
  expect(Math.max(...calls), "no frame drew the shadow pass").toBeGreaterThan(Math.min(...calls));
});

test("the town's first paint is text, and nothing shifts", async ({ page }) => {
  await page.goto("/");
  const { lcpTag, lcpUrl, cls, shifts } = await pageMetrics(page);
  expect(lcpTag).not.toBe("CANVAS");
  expect(lcpTag).not.toBe("IMG");
  expect(lcpUrl).toBe("");
  expect(cls, `shifted: ${shifts.join(",")}`).toBe(0);
  await ready(page);
});

test.describe("with reduced motion, after switching to Story", () => {
  test.use({ reducedMotion: "reduce" });

  // Reduced motion starts in Text; this visitor switched to Story on an earlier
  // visit, so the saved mode is Story (on Low, as the file-level seed pins).
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      if (sessionStorage.getItem("story-seeded")) return;
      localStorage.setItem(
        "bc",
        JSON.stringify({ state: { qualityMode: "Low", seen: false, mode: "story" }, version: 1 }),
      );
      sessionStorage.setItem("story-seeded", "1");
    });
  });

  test("the town opens on Low, still and responsive", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveClass(/mode-story/);
    await expect(page.locator("html")).toHaveClass(/town-ready/, { timeout: 20_000 });
    await page.getByRole("radio", { name: "Explore" }).click();
    await ready(page);
    await expect(card(page, "Headquarters")).toBeVisible();
    await page.keyboard.press("ArrowRight");
    await expect(card(page, "F1 Tracker")).toBeVisible();
  });
});

declare global {
  interface Window {
    __baseCamp?: {
      screenOf(t: string): { x: number; y: number } | null;
      info(): {
        frame: number;
        calls: number;
        triangles: number;
        geometries: number;
        textures: number;
      };
    };
  }
}

const screenOf = (page: Page, target: "hat" | "car0") =>
  page.evaluate((t) => window.__baseCamp?.screenOf(t) ?? null, target);

/** Waits for the target to be on screen, then clicks it; a moving target gets up to 3 tries. */
const clickTarget = async (page: Page, target: "hat" | "car0", toast: string) => {
  for (let attempt = 0; attempt < 3; attempt++) {
    await expect
      .poll(() => screenOf(page, target), { message: `${target} on screen` })
      .not.toBeNull();
    const at = await screenOf(page, target);
    if (!at) continue;
    await page.mouse.click(at.x, at.y);
    try {
      await expect(page.getByText(toast)).toBeVisible({ timeout: 1000 });
      return;
    } catch {
      // Missed (the target moved or was not placed yet): read the position again.
    }
  }
  await expect(page.getByText(toast)).toBeVisible();
};

test("the straw hat unlocks Straw hat", async ({ page }) => {
  await page.goto("/#arena");
  await ready(page);
  await clickTarget(page, "hat", "Achievement unlocked · Straw hat");
});

test("an F1 car unlocks Fastest lap", async ({ page }) => {
  await page.goto("/#f1-tracker");
  await ready(page);
  await clickTarget(page, "car0", "Achievement unlocked · Fastest lap");
});
