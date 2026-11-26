import { dayAmount } from "../world/lib/sun.ts";

const crossing = (lo: number, hi: number) => {
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
      savedMode = state?.chosenMode ?? null;
    }
  } catch {
    quality = null;
    savedMode = null;
  }

  const reducedMotion =
    typeof win.matchMedia === "function" &&
    win.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const connection = (win.navigator as Navigator & { connection?: { saveData?: boolean } })
    .connection;
  const saveData = Boolean(connection?.saveData);

  let failed = false;
  try {
    failed = win.sessionStorage.getItem("bc-town-failed") === "1";
  } catch {
    failed = false;
  }

  const slug = String(win.location?.hash ?? "")
    .replace(/^#/, "")
    .toLowerCase();
  let mode: string;
  if (slug === "text") mode = "text";
  else if (opts.exploreOnly.indexOf(slug) !== -1) mode = failed ? "story" : "explore";
  else if (savedMode === "story" || savedMode === "text") mode = savedMode;
  else if (savedMode === "explore") mode = failed ? "story" : "explore";
  else mode = reducedMotion || saveData || quality === "Lite" ? "text" : "story";

  root.classList.add("mode-" + mode);

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
