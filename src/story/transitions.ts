import type { PlaceId } from "@/content/types";
import { STOPS } from "@/content/tour";
import { useBaseCamp, type BaseCampState } from "@/store/store";

const CANT_DRAW = "Your browser can't draw the 3D town";
export const LITE_HINT = "3D is off (Lite) - choose Explore to turn it back on";

const hasWebgl = () =>
  typeof document !== "undefined" && document.documentElement.classList.contains("has-webgl");

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
  s.select(place ?? STOPS[s.stop]?.place ?? "hq");
  s.setMode("explore");
};

export const enterStory = () => useBaseCamp.getState().setMode("story");

export const enterText = () => useBaseCamp.getState().setMode("text");
