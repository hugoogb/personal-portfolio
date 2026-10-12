import type { Tier } from "@/boot/tiers";

/** Effects are a High-only finish (spec 5.5, 8). */
export const effectsEnabled = (tier: Tier) => tier === 3;

/** Bloom below this strength is invisible, so the pass is skipped (spec 5.5). */
export const BLOOM_MIN = 0.04;
export const bloomOn = (strength: number) => strength > BLOOM_MIN;

/** The composer renders through half-float targets; without these extensions the context cannot (spec 5.5). */
export const canRenderHalfFloat = (gl: { extensions: { has: (name: string) => boolean } }) =>
  gl.extensions.has("EXT_color_buffer_float") || gl.extensions.has("EXT_color_buffer_half_float");

/**
 * The same question asked of a throwaway context, before the town's canvas
 * exists: that canvas skips MSAA only if the composer is sure to run on it.
 */
export const probeHalfFloat = (doc: Document = document): boolean => {
  try {
    const gl = doc.createElement("canvas").getContext("webgl2");
    if (!gl) return false;
    const able = canRenderHalfFloat({ extensions: { has: (n) => gl.getExtension(n) !== null } });
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return able;
  } catch {
    return false;
  }
};
