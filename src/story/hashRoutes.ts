import { placeBySlug } from "@/content/places";
import { TOUR_PLACES } from "@/content/tour";
import { baseCamp } from "@/store/core";
import { enterExplore, enterText } from "@/story/transitions";

const BY_HASH = { chosen: false };

export const startHashRoutes = () => {
  const onHash = () => {
    const slug = location.hash.replace(/^#/, "").toLowerCase();
    const s = baseCamp.getState();
    if (slug === "text") return s.mode === "text" ? undefined : enterText(BY_HASH);
    const place = placeBySlug(slug);
    if (!place) return;
    if (s.mode === "explore") return s.select(place.id);
    if (!TOUR_PLACES.includes(place.id) && s.mode === "story") enterExplore(place.id, BY_HASH);
  };
  window.addEventListener("hashchange", onHash);
  return () => window.removeEventListener("hashchange", onHash);
};
