import "@fontsource/barlow-condensed/600.css";
import "@/hud/hud.css";
import type { ReactNode } from "react";
import { PLACE_BY_ID } from "@/content/places";
import { closeBrief } from "@/hud/actions";
import { Hint } from "@/hud/Hint";
import { PlaceCard } from "@/hud/PlaceCard";
import { PlacesList } from "@/hud/PlacesList";
import { useHudTheme } from "@/hud/theme";
import { Toasts } from "@/hud/Toasts";
import { TopBar } from "@/hud/TopBar";
import { useDeepLinks } from "@/hud/useDeepLinks";
import { useHudKeys } from "@/hud/useHudKeys";
import { useBaseCamp } from "@/store/store";

/** The stage: the canvas underneath, the DOM HUD on top (spec 4.3). */
export function Hud({ world }: { world: ReactNode }) {
  const theme = useHudTheme();
  const selected = useBaseCamp((s) => s.selected);
  const briefOpen = useBaseCamp((s) => s.briefOpen);
  useHudKeys();
  useDeepLinks();

  return (
    <>
      <div className="stage" data-hud={theme} inert={briefOpen}>
        <div className="stage__canvas" aria-hidden="true">
          {world}
        </div>
        <div className="hud">
          <TopBar />
          <PlacesList />
          <Toasts />
          {selected ? <PlaceCard key={selected} place={PLACE_BY_ID[selected]} /> : <Hint />}
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
