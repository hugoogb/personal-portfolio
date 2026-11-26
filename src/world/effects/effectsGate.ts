import type { Tier } from "@/boot/tiers";

export const effectsEnabled = (tier: Tier) => tier === 3;

export const BLOOM_MIN = 0.04;
export const bloomOn = (strength: number) => strength > BLOOM_MIN;

export const canRenderHalfFloat = (gl: { extensions: { has: (name: string) => boolean } }) =>
  gl.extensions.has("EXT_color_buffer_float") || gl.extensions.has("EXT_color_buffer_half_float");

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
