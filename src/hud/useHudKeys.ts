import { useEffect } from "react";
import { PLACE_BY_ID, stepPlace } from "@/content/places";
import { runPrimary, runSecondary, runTertiary } from "@/hud/actions";
import { keyAction } from "@/hud/keys";
import { enterStory } from "@/story/transitions";
import { useBaseCamp, type BaseCampState } from "@/store/store";

/** Esc closes the innermost thing first, then returns to the story (story spec 3.3). */
const escape = (s: BaseCampState) => {
  if (s.consoleOpen) return s.setConsoleOpen(false);
  if (s.panel) return s.setPanel(null);
  if (s.driving) return s.setDriving(false);
  enterStory(s.selected);
};

export const useHudKeys = () => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const action = keyAction(e);
      if (!action) return;
      const s = useBaseCamp.getState();
      // The build-in is still playing: the town is not interactive yet.
      if (!s.introDone) return;
      // While driving, the town's shortcuts stand down.
      if (s.driving && action !== "escape") return;
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
