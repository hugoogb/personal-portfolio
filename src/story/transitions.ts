import type { PlaceId } from "@/content/types";
import { STOPS, stopIndexForPlace } from "@/content/tour";
import { useBaseCamp, type BaseCampState } from "@/store/store";
import { stopInView } from "@/story/progress";
import { prefersReducedMotion } from "@/utils/motion";

const CANT_DRAW = "Your browser can't draw the 3D town";
export const LITE_HINT = "3D is off (Lite) - choose Explore to turn it back on";

// Town probes WebGL2 after first paint and marks html.no-webgl when it is missing; until
// then the device is given the benefit of the doubt.
const hasWebgl = () =>
  typeof document === "undefined" || !document.documentElement.classList.contains("no-webgl");

/** The town was turned off by the visitor's Lite choice, not by the device. */
export const liteOff = (s: Pick<BaseCampState, "town" | "qualityMode">) =>
  s.town === "off" && s.qualityMode === "Lite" && hasWebgl();

/**
 * Why Explore cannot be chosen, or null when it can (spec 3.4): it needs WebGL2
 * and a town that has not failed. A town that is still loading, or that Lite
 * turned off, can be chosen from any mode.
 */
export const exploreBlocked = (s: Pick<BaseCampState, "town" | "qualityMode">) =>
  !hasWebgl() || (s.town === "off" && !liteOff(s)) ? CANT_DRAW : null;

/**
 * A mode change is the visitor's choice (the switch, the finale, Esc, the console,
 * HQ's "About me"), saved for the next visit, unless a hash asked for it.
 */
export interface How {
  chosen?: boolean;
}

/** "instant", not "auto": the page's smooth scroll-behavior would turn "auto" into a fly-past. */
export const scrollToStop = (i: number, smooth = false) => {
  const stop = STOPS[Math.max(0, Math.min(STOPS.length - 1, i))];
  document.getElementById(stop.anchor)?.scrollIntoView({
    block: stop.id === "top" ? "start" : "center",
    behavior: smooth && !prefersReducedMotion() ? "smooth" : "instant",
  });
};

/** Where Story was when Explore opened: Explore's layout pins the page to the top. */
let left: { y: number; stop: number } | null = null;

/** The stop to show on leaving Explore: the selected place's, the very spot Story left from when it is the same place. */
const stopLeavingExplore = (s: BaseCampState, place?: PlaceId | null) => {
  const at = place ?? s.selected;
  if (!at) return left?.stop ?? s.stop;
  if (left && STOPS[left.stop]?.place === at) return left.stop;
  return stopIndexForPlace(at);
};

/** Scroll there now (the layout is already the new mode's) and again next frame, as a safety. */
const land = (i: number, y: number | null) => {
  const go = () =>
    y === null ? scrollToStop(i) : window.scrollTo({ top: y, behavior: "instant" });
  go();
  if (typeof requestAnimationFrame === "function") requestAnimationFrame(go);
};

/**
 * Explore from any mode. The town loads at once if it is not in yet (the still
 * image shows meanwhile, the HUD waits for the first frame); after Lite, the 3D
 * comes back at the device's own tier, or Low when that pick was Lite too.
 */
export const enterExplore = (place?: PlaceId, { chosen = true }: How = {}) => {
  const s = useBaseCamp.getState();
  if (exploreBlocked(s)) return;
  // Text has no driver, so its stop is measured now; Story's is the driver's.
  const stop = s.mode === "text" ? (stopInView() ?? s.stop) : s.stop;
  if (stop !== s.stop) s.setStop(stop);
  left = s.mode === "story" ? { y: window.scrollY, stop } : null;
  if (liteOff(s)) {
    s.setQualityMode(s.autoTier === 0 ? "Low" : "auto");
    s.setTown("loading");
  }
  // The finale has no place: deselect, so the camera stays at the overview.
  const target = place ?? STOPS[stop]?.place ?? null;
  if (target) s.select(target);
  else s.deselect();
  s.setMode("explore");
  if (chosen) s.chooseMode("explore");
};

export const enterStory = (place?: PlaceId | null, { chosen = true }: How = {}) => {
  const s = useBaseCamp.getState();
  let i: number;
  let y: number | null = null;
  if (s.mode === "text") {
    i = place ? stopIndexForPlace(place) : (stopInView() ?? s.stop);
  } else if (s.mode === "explore") {
    // No place and no selection (Esc after the finale's Explore): back to where the tour was.
    i = stopLeavingExplore(s, place);
    if (left && left.stop === i) y = left.y;
  } else {
    i = place ? stopIndexForPlace(place) : s.stop;
  }
  left = null;
  s.setStop(i);
  // The mode first: the class restores Story's layout at once, so the scroll below lands
  // before the driver's first announce, which then sees the target and nothing on the way.
  s.setMode("story");
  if (chosen) s.chooseMode("story");
  land(i, y);
};

export const enterText = ({ chosen = true }: How = {}) => {
  const s = useBaseCamp.getState();
  if (chosen) s.chooseMode("text");
  if (s.mode === "text") return;
  const i = s.mode === "explore" ? stopLeavingExplore(s) : s.stop;
  left = null;
  s.setStop(i);
  s.setMode("text");
  land(i, null);
};
