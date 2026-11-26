import type { Tier } from "@/boot/tiers";
import { CAPS } from "@/world/traffic/model";

export const trafficCaps = (tier: Tier, reduced: boolean) =>
  reduced ? { req: 0, res: 0 } : CAPS[tier];
