import type { Tier } from "@/boot/tiers";

/** Effects are a High-only finish (spec 5.5, 8). */
export const effectsEnabled = (tier: Tier) => tier === 3;

/** Bloom below this strength is invisible, so the pass is skipped (spec 5.5). */
export const BLOOM_MIN = 0.04;
export const bloomOn = (strength: number) => strength > BLOOM_MIN;
