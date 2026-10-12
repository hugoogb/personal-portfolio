import * as THREE from "three";
import { SUNRISE, SUNSET, dayAmount, smoothstep } from "@/world/lib/sun";

export interface LightingState {
  day: number;
  night: number;
  /** Drives every night light (spec 6). */
  lit: number;
  /** Sun position relative to the camera target, its colour and strength. */
  sun: { offset: [number, number, number]; color: string; intensity: number };
  hemi: { sky: string; ground: string; intensity: number };
  background: string;
  water: string;
  windows: { bright: number; dim: number };
  lamps: number;
  signs: number;
  packets: number;
  stadium: number;
  pools: number;
  board: number;
  /** Bloom strength for the High-only effects (Phase 5); off below 0.04. */
  bloom: number;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const C = (hex: string) => new THREE.Color(hex);
const hex = (c: THREE.Color) => `#${c.getHexString()}`;

/** Everything the town's light depends on, from the hour in Barcelona (spec 6). */
export function lighting(h: number): LightingState {
  const day = dayAmount(h);
  const night = 1 - day;
  const s = clamp((h - SUNRISE) / (SUNSET - SUNRISE), 0, 1);
  const elev = Math.sin(Math.PI * s);
  const az = Math.PI * (1 - s);
  const offset: [number, number, number] =
    day > 0.5 ? [Math.cos(az) * 24, 4 + elev * 26, 16] : [-12, 24, 18];
  const warm = C("#ffb27a").lerp(C("#fff6ea"), smoothstep(0, 0.55, elev));
  const dayCol = C("#bfe3ef").lerp(C("#f3c9a1"), (1 - smoothstep(0.15, 0.6, elev)) * 0.85);
  const background = C("#111d36")
    .lerp(C("#7d74a6"), smoothstep(0, 0.5, day))
    .lerp(dayCol, smoothstep(0.45, 1, day));
  const lit = smoothstep(0.25, 0.75, night);
  return {
    day,
    night,
    lit,
    sun: {
      offset,
      color: hex(C("#9db4ff").lerp(warm, day)),
      intensity: lerp(1.0, 1.1 + 2.0 * elev, day),
    },
    hemi: {
      sky: hex(C("#4a5f9c").lerp(C("#cfe6ff"), day)),
      ground: hex(C("#2a3550").lerp(C("#5b7a4a"), day)),
      intensity: lerp(1.15, 1.25, day),
    },
    background: hex(background),
    water: hex(C("#173049").lerp(C("#4f9fcf"), day)),
    windows: { bright: lit * 0.95, dim: lit * 0.55 },
    lamps: lit * 1.25,
    signs: lit * 0.3,
    packets: 0.7 + lit * 0.6,
    stadium: lit * 8,
    pools: lit * 0.32,
    board: 0.15 + lit * 0.9,
    bloom: lit * 0.42,
  };
}
