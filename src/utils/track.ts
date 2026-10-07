import { track } from "@vercel/analytics";
import { TIER_NAMES, type QualityMode, type Tier, type TierSignals } from "@/boot/tiers";
import type { AchievementId } from "@/content/achievements";
import type { PlaceId } from "@/content/types";

/**
 * Analytics must never break or slow the page: `track` is a no-op in
 * development and when the script is blocked, and any throw is swallowed here.
 * (Custom events need Vercel's Pro plan; on Hobby they are accepted and dropped.)
 */
const send = (name: string, data: Record<string, string>) => {
  try {
    track(name, data);
  } catch {
    // Analytics is optional.
  }
};

/**
 * Which projects people actually open is the one thing this site cannot tell me
 * from page views alone - every project lives on a different domain, so the
 * click is the last thing measurable from here.
 */
export const trackOutbound = (url: string, label: string) => {
  if (!url) return;
  send("outbound", { url, label });
};

export type BriefSource = "key" | "button" | "card" | "console" | "deeplink";
export type TierReason =
  | "auto"
  | "saved"
  | "no-webgl"
  | "reduced-motion"
  | "save-data"
  | "gpu"
  | "governor"
  | "manual";

export const trackPlace = (id: PlaceId) => send("place_select", { id });
export const trackAchievement = (id: AchievementId) => send("achievement", { id });
export const trackBrief = (source: BriefSource) => send("brief_open", { source });
export const trackTier = (initial: Tier, final: Tier, reason: TierReason) =>
  send("tier", { initial: TIER_NAMES[initial], final: TIER_NAMES[final], reason });

/** Why boot picked its tier, in the same order chooseTier checks (spec 8). */
export const bootReason = (s: TierSignals, mode: QualityMode): TierReason => {
  if (!s.webgl) return "no-webgl";
  if (mode !== "auto") return "saved";
  if (s.reducedMotion) return "reduced-motion";
  if (s.saveData) return "save-data";
  if (s.gpuTier === 0) return "gpu";
  return "auto";
};
