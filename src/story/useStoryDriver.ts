import { useEffect } from "react";
import { PROJECT_IDS } from "@/content/places";
import { RAIL_STOPS, STOPS } from "@/content/tour";
import { useBaseCamp } from "@/store/store";
import { currentStop, progress, readCenters, stopProgress, storySections } from "@/story/progress";
import { prefersReducedMotion } from "@/utils/motion";

const ARRIVES = new Set<string>([...PROJECT_IDS, "post"]);

/** Scroll position to tour stop (spec 5.3). Active in Story only. */
export const useStoryDriver = () => {
  const mode = useBaseCamp((s) => s.mode);
  useEffect(() => {
    if (mode !== "story") return;
    const sections = storySections();
    if (!sections.length) return;
    let centers: number[] = [];
    let last = -1;
    const measure = () => {
      centers = readCenters(sections);
    };
    const announce = (i: number) => {
      const stop = STOPS[i];
      const s = useBaseCamp.getState();
      s.setStop(i);
      const url = stop.id === "top" ? location.pathname + location.search : `#${stop.anchor}`;
      history.replaceState(history.state, "", url);
      // A stop outside the rail (the finale) shows the nearest rail stop before it.
      let at = i;
      while (at > 0 && !STOPS[at].rail) at--;
      const shown = STOPS[at];
      document.querySelectorAll("[data-rail], [data-rail-chip]").forEach((a) => {
        const id = a.getAttribute("data-rail") ?? a.getAttribute("data-rail-chip");
        if (id === shown.id) a.setAttribute("aria-current", "true");
        else a.removeAttribute("aria-current");
      });
      const railIndex = RAIL_STOPS.findIndex((r) => r.id === shown.id);
      if (railIndex >= 0) {
        const label = document.querySelector("[data-rail-label]");
        const count = document.querySelector("[data-rail-count]");
        if (label) label.textContent = shown.label;
        if (count) count.textContent = `${railIndex + 1} / ${RAIL_STOPS.length}`;
      }
      if (stop.place) s.select(stop.place);
      if (stop.place && ARRIVES.has(stop.place) && !prefersReducedMotion()) s.arrive(stop.place);
    };
    const update = () => {
      const p = stopProgress(centers, window.scrollY + window.innerHeight / 2);
      progress.index = p.index;
      progress.fraction = p.fraction;
      const i = currentStop(p);
      if (i !== last) {
        if (last >= 0 && prefersReducedMotion()) progress.cut++;
        last = i;
        announce(i);
      }
    };
    const onResize = () => {
      measure();
      update();
    };
    measure();
    update();
    const ro = typeof ResizeObserver === "function" ? new ResizeObserver(onResize) : null;
    const story = document.getElementById("story");
    if (story) ro?.observe(story);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      ro?.disconnect();
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", onResize);
    };
  }, [mode]);
};
