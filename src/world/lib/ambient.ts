import type { Tier } from "@/boot/tiers";
import { CAPS } from "@/world/traffic/model";

/**
 * Reduced motion inside the town (spec 9.7): nothing decorative moves on its
 * own, traffic included. What the visitor starts (driving, the wave, the
 * caravel, the lap flash) still moves, because they asked for it.
 */
export const trafficCaps = (tier: Tier, reduced: boolean) =>
  reduced ? { req: 0, res: 0 } : CAPS[tier];
