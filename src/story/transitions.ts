import type { PlaceId } from "@/content/types";
import { STOPS } from "@/content/tour";
import { useBaseCamp } from "@/store/store";

/** Explore needs a town that has drawn; it selects the given place, or the current stop's. */
export const enterExplore = (place?: PlaceId) => {
  const s = useBaseCamp.getState();
  if (s.town !== "ready") return;
  s.select(place ?? STOPS[s.stop]?.place ?? "hq");
  s.setMode("explore");
};

export const enterStory = () => useBaseCamp.getState().setMode("story");

export const enterText = () => useBaseCamp.getState().setMode("text");
