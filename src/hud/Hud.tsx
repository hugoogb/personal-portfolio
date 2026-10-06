import "@fontsource/barlow-condensed/600.css";
import "@/hud/hud.css";
import type { ReactNode } from "react";
import { PLACE_BY_ID } from "@/content/places";
import { closeBrief } from "@/hud/actions";
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
import { useDeepLinks } from "@/hud/useDeepLinks";
import { useHudKeys } from "@/hud/useHudKeys";
import { useStatus } from "@/hooks/useStatus";
import { useBaseCamp } from "@/store/store";

/** The stage: the canvas underneath, the DOM HUD on top (spec 4.3). */
export function Hud({ world }: { world: ReactNode }) {
  const theme = useHudTheme();
  const selected = useBaseCamp((s) => s.selected);
  const briefOpen = useBaseCamp((s) => s.briefOpen);
  const panel = useBaseCamp((s) => s.panel);
  const consoleOpen = useBaseCamp((s) => s.consoleOpen);
  const driving = useBaseCamp((s) => s.driving);
  const introDone = useBaseCamp((s) => s.introDone);
  useHudKeys();
  useStatus();
  useDeepLinks();

  return (
    <>
      <div className="stage" data-hud={theme} inert={briefOpen || !introDone}>
        <div className="stage__canvas" aria-hidden="true">
          {world}
        </div>
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
      {briefOpen && (
        <button type="button" className="brief-close" onClick={closeBrief}>
          Back to the town
        </button>
      )}
    </>
  );
}
