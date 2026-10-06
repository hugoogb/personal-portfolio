import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { useEffect } from "react";
import { useAccentFavicon } from "@/hooks/useAccentFavicon";
import { useBaseCamp } from "@/store/store";
import { trackOutbound } from "@/utils/track";

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

  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
