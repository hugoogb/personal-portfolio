import { useEffect } from "react";
import { placeBySlug } from "@/content/places";
import { TOUR_PLACES } from "@/content/tour";
import { useBaseCamp } from "@/store/store";
import { enterExplore, enterText } from "@/story/transitions";

/** A hash picks the mode for this visit only, never the saved choice (spec 3.4). */
const BY_HASH = { chosen: false };

/**
 * Hash changes while the page is open (story spec 5.6). The first load is the head script's.
 * A tour section's hash in Story or Text is the browser's own anchor scroll.
 */
export const useHashRoutes = () => {
  useEffect(() => {
    const onHash = () => {
      const slug = location.hash.replace(/^#/, "").toLowerCase();
      const s = useBaseCamp.getState();
      if (slug === "text") return s.mode === "text" ? undefined : enterText(BY_HASH);
      const place = placeBySlug(slug);
      if (!place) return;
      if (s.mode === "explore") return s.select(place.id);
      if (!TOUR_PLACES.includes(place.id) && s.mode === "story") enterExplore(place.id, BY_HASH);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
};
