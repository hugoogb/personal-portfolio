import type { PlaceId } from "@/content/types";
import { STOPS, stopIndexForPlace } from "@/content/tour";
import { useBaseCamp, type BaseCampState } from "@/store/store";
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

export const scrollToStop = (i: number, smooth = false) => {
  const stop = STOPS[Math.max(0, Math.min(STOPS.length - 1, i))];
  document.getElementById(stop.anchor)?.scrollIntoView({
    block: stop.id === "top" ? "start" : "center",
    behavior: smooth && !prefersReducedMotion() ? "smooth" : "auto",
  });
};

/**
 * Explore from any mode. The town loads at once if it is not in yet (the still
 * image shows meanwhile, the HUD waits for the first frame); after Lite, the 3D
 * comes back at the device's own tier, or Low when that pick was Lite too.
 */
export const enterExplore = (place?: PlaceId) => {
  const s = useBaseCamp.getState();
  if (exploreBlocked(s)) return;
  if (liteOff(s)) {
    s.setQualityMode(s.autoTier === 0 ? "Low" : "auto");
    s.setTown("loading");
  }
  // The finale has no place: deselect, so the camera stays at the overview.
  const target = place ?? STOPS[s.stop]?.place ?? null;
  if (target) s.select(target);
  else s.deselect();
  s.setMode("explore");
};

export const enterStory = (place?: PlaceId | null) => {
  const s = useBaseCamp.getState();
  // No place and no selection (Esc after the finale's Explore): back to where the tour was.
  const i = (place ?? s.selected) ? stopIndexForPlace((place ?? s.selected)!) : s.stop;
  // Scroll first: the document keeps its layout in Explore, and the driver's first
  // announce on resuming then sees the target, not the pre-Explore position.
  scrollToStop(i);
  s.setMode("story");
  requestAnimationFrame(() => scrollToStop(i));
};

export const enterText = () => {
  const s = useBaseCamp.getState();
  const i = s.mode === "explore" && s.selected ? stopIndexForPlace(s.selected) : s.stop;
  s.setMode("text");
  requestAnimationFrame(() => scrollToStop(i));
};
