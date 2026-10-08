import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { useEffect } from "react";
import { Boot } from "@/boot/Boot";
import { useAccentFavicon } from "@/hooks/useAccentFavicon";
import { useBaseCamp } from "@/store/store";
import { trackAchievement, trackOutbound, trackPlace } from "@/utils/track";

/**
 * What still needs JavaScript while the page itself is the static Brief:
 * analytics, the favicon that follows the accent, and outbound-click tracking
 * for links tagged with data-track. One delegated listener covers them all,
 * so the prerendered links need no handlers of their own.
 */
export function ClientRoot() {
  const accent = useBaseCamp((s) => s.accent);
  useAccentFavicon(accent);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.("a[data-track]");
      if (link instanceof HTMLAnchorElement) trackOutbound(link.href, link.dataset.track ?? "");
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // Seeded from the store as it is now, so saved achievements and a rehydrated
  // selection are not re-sent. The town's default HQ selection on a plain load
  // is not a visit either, so the first selection is skipped when it is "hq".
  useEffect(() => {
    let { selected, achievements } = useBaseCamp.getState();
    let firstSelection = selected === null;
    return useBaseCamp.subscribe((s) => {
      if (s.selected !== selected) {
        const id = s.selected;
        selected = id;
        if (id !== null) {
          if (!(firstSelection && id === "hq")) trackPlace(id);
          firstSelection = false;
        }
      }
      if (s.achievements !== achievements) {
        const known = achievements;
        achievements = s.achievements;
        for (const id of s.achievements) if (!known.includes(id)) trackAchievement(id);
      }
    });
  }, []);

  return (
    <>
      <Analytics />
      <SpeedInsights />
      <Boot />
    </>
  );
}
