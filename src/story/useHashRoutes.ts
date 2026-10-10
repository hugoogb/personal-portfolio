import { useEffect } from "react";
import { placeBySlug } from "@/content/places";
import { TOUR_PLACES } from "@/content/tour";
import { useBaseCamp } from "@/store/store";
import { enterExplore, enterText } from "@/story/transitions";

/** Hash changes while the page is open (story spec 5.6). The first load is the head script's. */
export const useHashRoutes = () => {
  useEffect(() => {
    const onHash = () => {
      const slug = location.hash.replace(/^#/, "").toLowerCase();
      if (slug === "text") return enterText();
      const place = placeBySlug(slug);
      if (!place) return;
      const s = useBaseCamp.getState();
      if (s.mode === "explore") return s.select(place.id);
      if (!TOUR_PLACES.includes(place.id) && s.mode === "story") enterExplore(place.id);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
};
