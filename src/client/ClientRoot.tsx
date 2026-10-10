import { SpeedInsights } from "@vercel/speed-insights/react";
import { Boot } from "@/boot/Boot";
import { useAccentFavicon } from "@/hooks/useAccentFavicon";
import { useBaseCamp } from "@/store/store";

/**
 * What still needs JavaScript while the page itself is the static Brief:
 * Speed Insights, and the favicon that follows the accent.
 */
export function ClientRoot() {
  const accent = useBaseCamp((s) => s.accent);
  useAccentFavicon(accent);

  return (
    <>
      <SpeedInsights />
      <Boot />
    </>
  );
}
