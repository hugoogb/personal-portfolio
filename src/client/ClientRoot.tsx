import { SpeedInsights } from "@vercel/speed-insights/react";
import { useEffect } from "react";
import { Town } from "@/boot/Town";
import { useAccentFavicon } from "@/hooks/useAccentFavicon";
import { useStatus } from "@/hooks/useStatus";
import { ModeSwitch } from "@/story/ModeSwitch";
import { enterExplore, exploreBlocked } from "@/story/transitions";
import { useHashRoutes } from "@/story/useHashRoutes";
import { useStoryDriver } from "@/story/useStoryDriver";
import { useStoryStatus } from "@/story/useStoryStatus";
import { useBaseCamp } from "@/store/store";

/** Everything on the page that needs JavaScript: the mode switch, the town, the favicon. */
export function ClientRoot() {
  const accent = useBaseCamp((s) => s.accent);
  const mode = useBaseCamp((s) => s.mode);
  const town = useBaseCamp((s) => s.town);
  const qualityMode = useBaseCamp((s) => s.qualityMode);
  useAccentFavicon(accent);
  // Polling runs in every mode; the pills and the tour only matter in the story document.
  useStatus();
  useStoryStatus();
  useStoryDriver();
  useHashRoutes();

  // The document is never hydrated: the finale's prompt and the inert story are wired here.
  useEffect(() => {
    document.getElementById("story")?.toggleAttribute("inert", mode === "explore");
    document.getElementById("rail")?.toggleAttribute("inert", mode === "explore");
    const cta = document.querySelector<HTMLButtonElement>("[data-explore-cta]");
    // Same rule as the switch's Explore option.
    if (cta) cta.disabled = mode !== "story" || exploreBlocked({ town, qualityMode }) !== null;
  }, [mode, town, qualityMode]);

  // The finale's prompt (the button's `disabled` is kept up to date above).
  useEffect(() => {
    const cta = document.querySelector<HTMLButtonElement>("[data-explore-cta]");
    const onClick = () => enterExplore();
    cta?.addEventListener("click", onClick);
    return () => cta?.removeEventListener("click", onClick);
  }, []);

  return (
    <>
      <SpeedInsights />
      <Town />
      {/* After the town, so in Explore it is the HUD's last tab stop, not its first. */}
      <ModeSwitch />
    </>
  );
}
