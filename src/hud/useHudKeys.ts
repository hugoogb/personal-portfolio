import { useEffect } from "react";
import { PLACE_BY_ID, stepPlace } from "@/content/places";
import { closeBrief, runPrimary, runSecondary, runTertiary, toggleBrief } from "@/hud/actions";
import { keyAction } from "@/hud/keys";
import { useBaseCamp, type BaseCampState } from "@/store/store";

/** Esc closes the innermost thing first, then deselects (spec 4.2). */
const escape = (s: BaseCampState) => {
  if (s.briefOpen) return closeBrief();
  if (s.consoleOpen) return s.setConsoleOpen(false);
  if (s.panel) return s.setPanel(null);
  if (s.driving) return s.setDriving(false);
  s.deselect();
};

export const useHudKeys = () => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const action = keyAction(e);
      if (!action) return;
      const s = useBaseCamp.getState();
      // The title card or the build-in is still up: the town is not interactive yet.
      // The Brief can already be open over it (a first-visit deep link), and
      // must stay closable or the build-in never resumes.
      if (!s.introDone && !(s.briefOpen && (action === "escape" || action === "brief"))) return;
      // While driving or reading the Brief, the town's shortcuts stand down.
      if (s.driving && action !== "escape") return;
      if (s.briefOpen && action !== "escape" && action !== "brief") return;
      // A dialog owns the keyboard: arrows, letters and links must not leak out of it.
      if ((s.panel || s.consoleOpen) && action !== "escape" && action !== "console") return;
      e.preventDefault();
      const place = s.selected ? PLACE_BY_ID[s.selected] : null;
      switch (action) {
        case "next":
          return s.select(stepPlace(s.selected, 1));
        case "prev":
          return s.select(stepPlace(s.selected, -1));
        case "primary":
          return place && runPrimary(place);
        case "secondary":
          return place && runSecondary(place);
        case "tertiary":
          return place && runTertiary(place);
        case "brief":
          return toggleBrief("key");
        case "console":
          return s.setConsoleOpen(!s.consoleOpen);
        case "escape":
          return escape(s);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
};
