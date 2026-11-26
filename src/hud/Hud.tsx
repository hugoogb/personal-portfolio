import "@fontsource/barlow-condensed/600.css";
import "@/hud/hud.css";
import { useEffect } from "react";
import { PLACE_BY_ID, placeBySlug } from "@/content/places";
import { STOPS } from "@/content/tour";
import { Console } from "@/hud/Console";
import { DriveBar } from "@/hud/DriveBar";
import { Hint } from "@/hud/Hint";
import { Minimap } from "@/hud/Minimap";
import { Objective } from "@/hud/Objective";
import { PlaceCard } from "@/hud/PlaceCard";
import { PlacesList } from "@/hud/PlacesList";
import { Settings } from "@/hud/Settings";
import { useHudTheme } from "@/hud/theme";
import { Toasts } from "@/hud/Toasts";
import { TopBar } from "@/hud/TopBar";
import { Trophies } from "@/hud/Trophies";
import { useHudKeys } from "@/hud/useHudKeys";
import { useBaseCamp } from "@/store/store";

export function Hud() {
  const theme = useHudTheme();
  const selected = useBaseCamp((s) => s.selected);
  const panel = useBaseCamp((s) => s.panel);
  const consoleOpen = useBaseCamp((s) => s.consoleOpen);
  const driving = useBaseCamp((s) => s.driving);
  const introDone = useBaseCamp((s) => s.introDone);
  useHudKeys();

  useEffect(() => {
    const s = useBaseCamp.getState();
    const place = placeBySlug(window.location.hash);
    if (place) s.select(place.id);
    else if (!s.selected && STOPS[s.stop]?.place) s.select("hq");
  }, []);

  useEffect(() => {
    return useBaseCamp.subscribe((s, prev) => {
      if (s.selected === prev.selected) return;
      const url = s.selected ? `#${PLACE_BY_ID[s.selected].slug}` : location.pathname;
      history.replaceState(history.state, "", url);
    });
  }, []);

  return (
    <div className="stage" data-hud={theme} inert={!introDone}>
      <div className="hud">
        <TopBar />
        <PlacesList />
        <Objective />
        <Toasts />
        <div className="card-slot" aria-live="polite">
          {selected ? <PlaceCard key={selected} place={PLACE_BY_ID[selected]} /> : <Hint />}
        </div>
        <Minimap />
        {driving && <DriveBar />}
        {panel === "settings" && <Settings />}
        {panel === "trophies" && <Trophies />}
        {consoleOpen && <Console />}
      </div>
    </div>
  );
}
