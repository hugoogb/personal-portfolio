/**
 * Runs inline in <head>, before first paint (injected by vite.config.ts).
 *
 * It paints the visitor's saved accent so the prerendered page never flashes
 * orange first, and picks the mode: exactly one html.mode-story, mode-explore
 * or mode-text, from the hash (#text, or an explore-only place), the mode the
 * visitor last chose and what the device asks for. It also marks html.night when Barcelona is dark.
 * It never touches WebGL: Town probes for WebGL2 after first paint.
 *
 * It is shipped as its own source text (headScript below), so bootHead must
 * stay self-contained: only its parameters and globals, no module-level helpers.
 * This module is imported by vite.config.ts, so it imports sun by a relative path.
 */
import { dayAmount } from "../world/lib/sun.ts";

/** Barcelona hours where the lighting crosses half-night, found once at build time. */
const crossing = (lo: number, hi: number) => {
  // Bisection on dayAmount = 0.5; dayAmount rises in the morning and falls in the evening.
  const rising = dayAmount(hi) > dayAmount(lo);
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (dayAmount(mid) > 0.5 === rising) hi = mid;
    else lo = mid;
  }
  return (lo + hi) / 2;
};
export const NIGHT_BEFORE = crossing(4, 12);
export const NIGHT_AFTER = crossing(14, 23);

/** Kept as a literal: vite.config.ts cannot load the content (images). Tested against tour.ts. */
const EXPLORE_ONLY = ["arena", "departures", "server-yard", "stadium"];

export interface HeadOptions {
  exploreOnly: string[];
  nightBefore: number;
  nightAfter: number;
}

export function bootHead(
  doc: Document,
  win: Window,
  opts: HeadOptions,
  now: Date = new Date(),
): void {
  const root = doc.documentElement;
  let quality: unknown = null;
  let savedMode: unknown = null;

  try {
    const storage = win.localStorage;
    const accent = storage.getItem("color");
    if (accent && /^#[0-9a-fA-F]{6}$/.test(accent)) {
      root.style.setProperty("--primary-color", accent);
    }
    const saved = storage.getItem("bc");
    if (saved) {
      const state = JSON.parse(saved)?.state;
      quality = state?.qualityMode ?? null;
      // The mode the visitor chose; records from before chosenMode keep theirs under `mode`.
      savedMode = (state?.chosenMode !== undefined ? state.chosenMode : state?.mode) ?? null;
    }
  } catch {
    // Storage blocked or a corrupt record: the defaults stand.
  }

  const reducedMotion =
    typeof win.matchMedia === "function" &&
    win.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const connection = (win.navigator as Navigator & { connection?: { saveData?: boolean } })
    .connection;
  const saveData = Boolean(connection?.saveData);

  // Town sets this when the town failed to draw, so a broken device does not wait again.
  let failed = false;
  try {
    failed = win.sessionStorage.getItem("bc-town-failed") === "1";
  } catch {
    failed = false;
  }

  const slug = String(win.location?.hash ?? "")
    .replace(/^#/, "")
    .toLowerCase();
  // No WebGL2 probe here: creating a context blocks first paint for a second on a slow device.
  // Town probes after first paint and, without WebGL2, falls back to Story on the still image.
  let mode: string;
  if (slug === "text") mode = "text";
  else if (opts.exploreOnly.indexOf(slug) !== -1) mode = failed ? "story" : "explore";
  else if (savedMode === "story" || savedMode === "text") mode = savedMode;
  else if (savedMode === "explore") mode = failed ? "story" : "explore";
  else mode = reducedMotion || saveData || quality === "Lite" ? "text" : "story";

  root.classList.add("mode-" + mode);

  // Barcelona's hour from UTC: CET, and CEST from the last Sunday of March to the last Sunday
  // of October, both switching at 01:00 UTC (the EU rule). Not Intl: its first use with a time
  // zone loads the zone data, about 20 ms before first paint on a slow phone.
  const year = now.getUTCFullYear();
  const lastSunday = (month: number) => {
    const d = new Date(Date.UTC(year, month + 1, 0, 1));
    d.setUTCDate(d.getUTCDate() - d.getUTCDay());
    return d.getTime();
  };
  const summer = now.getTime() >= lastSunday(2) && now.getTime() < lastSunday(9);
  const h = (now.getUTCHours() + now.getUTCMinutes() / 60 + (summer ? 2 : 1)) % 24;
  if (h < opts.nightBefore || h > opts.nightAfter) root.classList.add("night");
}

export const headScript = `(${bootHead.toString()})(document, window, ${JSON.stringify({
  exploreOnly: EXPLORE_ONLY,
  nightBefore: NIGHT_BEFORE,
  nightAfter: NIGHT_AFTER,
})});`;
