import { expect, test, type Page } from "@playwright/test";
import { pageMetrics } from "./pageMetrics";

// detect-gpu blocklists SwiftShader, so pin a manual quality: the town then
// loads on any WebGL context, exactly as "Enter the town anyway" does.
const LOW = JSON.stringify({
  state: { discovered: [], achievements: [], hudMode: "auto", qualityMode: "Low", seen: false },
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
  await expect(page.locator("html")).toHaveClass(/world-ready/, { timeout: 20_000 });
  await expect(page.locator(".stage")).not.toHaveAttribute("inert", { timeout: 10_000 });
};
const card = (page: Page, name: string) => page.getByRole("heading", { level: 2, name });

test("the town mounts without console errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error" && !isNoise(m.location().url)) errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await ready(page);
  await expect(page.locator(".stage canvas")).toBeVisible();
  await expect(card(page, "Headquarters")).toBeVisible();
  await expect(page.getByText("Hugo GB")).toBeVisible();
  expect(errors).toEqual([]);
});

test("/#readledger selects ReadLedger, with its screenshot", async ({ page }) => {
  await page.goto("/#readledger");
  await ready(page);
  await expect(card(page, "ReadLedger")).toBeVisible();
  // The Brief stays in the DOM under the town, so scope to the card.
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
  const box = (await page.locator(".stage canvas").boundingBox())!;
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;

  // The title card fades out for 0.45s after world-ready and still covers the
  // canvas until then, so an early click hits the card, not the town.
  await expect(page.locator(".title-card")).toBeHidden();

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

test("B opens the Brief over the town and Esc returns", async ({ page }) => {
  await page.goto("/");
  await ready(page);
  await page.keyboard.press("b");
  await expect(page.locator("html")).toHaveClass(/brief-open/);
  await expect(page.getByRole("heading", { level: 1, name: "Hugo García Benjumea" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Back to the town" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("html")).not.toHaveClass(/brief-open/);
});

test("/#work opens the Brief at Work", async ({ page }) => {
  await page.goto("/#work");
  // The Brief covers the town, so the stage stays inert: wait for the world, not for the HUD.
  await expect(page.locator("html")).toHaveClass(/world-ready/, { timeout: 20_000 });
  await expect(page.locator("#work")).toBeInViewport();
});

test("a first visit to /#work can close the Brief while the build-in waits behind it", async ({
  page,
}) => {
  // The seeded record above is a first visit (seen: false), so the build-in is due
  // but frozen under the Brief. Esc must still close it, or the town never wakes.
  await page.goto("/#work");
  await expect(page.locator("html")).toHaveClass(/world-ready/, { timeout: 20_000 });
  await expect(page.locator("html")).toHaveClass(/brief-open/);
  await page.keyboard.press("Escape");
  await expect(page.locator("html")).not.toHaveClass(/brief-open/);
  await expect(page.locator(".stage")).not.toHaveAttribute("inert", { timeout: 10_000 });
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

test("Lite returns to the Brief, and the town can be entered again", async ({ page }) => {
  await page.goto("/");
  await ready(page);
  await page.getByRole("button", { name: "Settings" }).click();
  // Picking Lite removes the radio itself, so check() cannot confirm its state; click it.
  await page.getByRole("radio", { name: "Lite" }).click();
  await expect(page.locator("html")).not.toHaveClass(/(^|\s)world(\s|$)/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.getByRole("button", { name: "Enter the town anyway" }).click();
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

test("a device without WebGL2 lands on the Brief, not a stuck title card", async ({ page }) => {
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
  await expect(page.locator("html")).not.toHaveClass(/world/);
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
  const HIGH = JSON.stringify({ state: { qualityMode: "High", seen: true }, version: 1 });

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

  test("dropping to Medium unmounts the effects without breaking the town", async ({ page }) => {
    await page.addInitScript((record) => localStorage.setItem("bc", record), HIGH);
    await page.goto("/");
    await ready(page);
    await page.getByRole("button", { name: "Settings" }).click();
    await page.getByRole("radio", { name: "Medium" }).check();
    await page.keyboard.press("Escape");
    await page.keyboard.press("ArrowRight");
    await expect(card(page, "F1 Tracker")).toBeVisible();
  });
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

test.describe("with reduced motion, entering anyway", () => {
  test.use({ reducedMotion: "reduce" });

  // The file-level seed pins Low, and a saved quality outranks reduced motion,
  // which would skip the Brief. Drop it once per tab so the visitor starts there.
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      if (sessionStorage.getItem("unseeded")) return;
      localStorage.removeItem("bc");
      sessionStorage.setItem("unseeded", "1");
    });
  });

  test("the town opens on Low, still and responsive", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Enter the town anyway" }).click();
    await ready(page);
    await expect(card(page, "Headquarters")).toBeVisible();
    await page.keyboard.press("ArrowRight");
    await expect(card(page, "F1 Tracker")).toBeVisible();
  });
});
