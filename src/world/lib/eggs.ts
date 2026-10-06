import type * as THREE from "three";

/** True when an egg hit target is among a ray's intersections: a place volume then lets the event through. */
export const eggUnderPointer = (hits: { object: THREE.Object3D }[]) =>
  hits.some((h) => h.object.userData.eggTarget === true);

export const SAIL_S = 9;
/** The caravel's offset from home at sail progress s (0..1): out and back (reference 1476). */
export const sailOffset = (s: number) => ({
  dx: Math.sin(s * Math.PI) * 9,
  dz: -Math.sin(s * Math.PI) * 5,
});

export const FLASH_S = 1.2;
/** The F1 cars blink purple at 10 Hz while a lap flash runs (reference 1445). */
export const flashOn = (flash: number, t: number) => flash > 0 && Math.floor(t * 10) % 2 === 1;

export const WAVE_END = 8;
/** How far a stadium seat rises as the wave passes it (reference 1470). */
export const waveLift = (wave: number, seat: [number, number, number]) => {
  const ang = Math.atan2(seat[2] + 0.4, seat[0]);
  const ph = ((ang + Math.PI) / (Math.PI * 2)) * 6.3;
  return Math.max(0, 1 - Math.abs(wave - ph) * 1.6);
};

export const CHEER_S = 1.8;
/** An egg fan's jump height during a cheer (reference 1473). */
export const cheerLift = (cheer: number, t: number, i: number) =>
  cheer > 0 ? Math.abs(Math.sin(t * 11 + i * 1.7)) * 0.13 : 0;
