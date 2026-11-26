import type { PlaceId } from "@/content/types";
import { STOPS, stopIndexForPlace } from "@/content/tour";
import { baseCamp, type BaseCampState } from "@/store/core";
import { readStops, stopInView } from "@/story/progress";
import { prefersReducedMotion } from "@/utils/motion";

const CANT_DRAW = "Your browser can't draw the 3D town";
export const LITE_HINT = "3D is off (Lite) - choose Explore to turn it back on";

const hasWebgl = () => !document.documentElement.classList.contains("no-webgl");

export const liteOff = (s: Pick<BaseCampState, "town" | "qualityMode">) =>
  s.town === "off" && s.qualityMode === "Lite" && hasWebgl();

export const exploreBlocked = (s: Pick<BaseCampState, "town" | "qualityMode">) =>
  !hasWebgl() || (s.town === "off" && !liteOff(s)) ? CANT_DRAW : null;

export interface How {
  chosen?: boolean;
}

export const scrollToStop = (i: number, smooth = false) => {
  const stop = STOPS[Math.max(0, Math.min(STOPS.length - 1, i))];
  const el = document.getElementById(stop.anchor);
  if (!el) return;
  const [line] = readStops([el]);
  window.scrollTo({
    top: Math.max(0, line - window.innerHeight / 2),
    behavior: smooth && !prefersReducedMotion() ? "smooth" : "instant",
  });
};

let left: { y: number; stop: number } | null = null;

const stopLeavingExplore = (s: BaseCampState, place?: PlaceId | null) => {
  const at = place ?? s.selected;
  if (!at) return left?.stop ?? s.stop;
  if (left && STOPS[left.stop]?.place === at) return left.stop;
  return stopIndexForPlace(at);
};

const land = (i: number, y: number | null) => {
  const go = () =>
    y === null ? scrollToStop(i) : window.scrollTo({ top: y, behavior: "instant" });
  go();
  requestAnimationFrame(go);
};

export const enterExplore = (place?: PlaceId, { chosen = true }: How = {}) => {
  const s = baseCamp.getState();
  if (exploreBlocked(s)) return;
  const stop = s.mode === "text" ? (stopInView() ?? s.stop) : s.stop;
  if (stop !== s.stop) s.setStop(stop);
  left = s.mode === "story" ? { y: window.scrollY, stop } : null;
  if (liteOff(s)) {
    s.setQualityMode(s.autoTier === 0 ? "Low" : "auto");
    s.setTown("loading");
  }
  const target = place ?? STOPS[stop]?.place ?? null;
  if (target) s.select(target);
  else s.deselect();
  s.setMode("explore");
  if (chosen) s.chooseMode("explore");
};

export const enterStory = (place?: PlaceId | null, { chosen = true }: How = {}) => {
  const s = baseCamp.getState();
  let i: number;
  let y: number | null = null;
  if (s.mode === "text") {
    i = place ? stopIndexForPlace(place) : (stopInView() ?? s.stop);
  } else if (s.mode === "explore") {
    i = stopLeavingExplore(s, place);
    if (left && left.stop === i) y = left.y;
  } else {
    i = place ? stopIndexForPlace(place) : s.stop;
  }
  left = null;
  s.setStop(i);
  s.setMode("story");
  if (chosen) s.chooseMode("story");
  land(i, y);
};

export const enterText = ({ chosen = true }: How = {}) => {
  const s = baseCamp.getState();
  if (chosen) s.chooseMode("text");
  if (s.mode === "text") return;
  const i = s.mode === "explore" ? stopLeavingExplore(s) : s.stop;
  left = null;
  s.setStop(i);
  s.setMode("text");
  land(i, null);
};
