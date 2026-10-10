import { SpeedInsights } from "@vercel/speed-insights/react";
import { useEffect } from "react";
import { Town } from "@/boot/Town";
import { useAccentFavicon } from "@/hooks/useAccentFavicon";
import { ModeSwitch } from "@/story/ModeSwitch";
import { useBaseCamp } from "@/store/store";

/** Everything on the page that needs JavaScript: the mode switch, the town, the favicon. */
export function ClientRoot() {
  const accent = useBaseCamp((s) => s.accent);
  const mode = useBaseCamp((s) => s.mode);
  const town = useBaseCamp((s) => s.town);
  useAccentFavicon(accent);

  // The document is never hydrated: the finale's prompt and the inert story are wired here.
  useEffect(() => {
    document.getElementById("story")?.toggleAttribute("inert", mode === "explore");
    document.getElementById("rail")?.toggleAttribute("inert", mode === "explore");
    const cta = document.querySelector<HTMLButtonElement>("[data-explore-cta]");
    if (cta) cta.disabled = mode !== "story" || town !== "ready";
  }, [mode, town]);

  return (
    <>
      <SpeedInsights />
      <Town />
      {/* After the town, so in Explore it is the HUD's last tab stop, not its first. */}
      <ModeSwitch />
    </>
  );
}
