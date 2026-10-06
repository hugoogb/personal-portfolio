export type Tier = 0 | 1 | 2 | 3;
export const TIER_NAMES = ["Lite", "Low", "Medium", "High"] as const;
export type TierName = (typeof TIER_NAMES)[number];
export type QualityMode = "auto" | TierName;
