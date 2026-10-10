import "@fontsource/barlow-condensed/600.css";
import "@/hud/hud.css";
import { useEffect } from "react";
import { PLACE_BY_ID, placeBySlug } from "@/content/places";
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
import { useStatus } from "@/hooks/useStatus";
import { useBaseCamp } from "@/store/store";

/**
 * The HUD over the town (spec 4.3, story spec 5.5). It mounts only in Explore;
 * the canvas itself lives in #town-root, under this stage, which lets clicks
 * through everywhere but on the HUD's own pieces.
 */
export function Hud() {
  const theme = useHudTheme();
  const selected = useBaseCamp((s) => s.selected);
  const panel = useBaseCamp((s) => s.panel);
  const consoleOpen = useBaseCamp((s) => s.consoleOpen);
  const driving = useBaseCamp((s) => s.driving);
  const introDone = useBaseCamp((s) => s.introDone);
  useHudKeys();
  useStatus();

  // Entering Explore from a link selects that link's place; otherwise keep the selection, or HQ.
  useEffect(() => {
    const s = useBaseCamp.getState();
    const place = placeBySlug(window.location.hash);
    if (place) s.select(place.id);
    else if (!s.selected) s.select("hq");
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
