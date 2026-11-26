import type * as THREE from "three";

export const eggUnderPointer = (hits: { object: THREE.Object3D }[]) =>
  hits.some((h) => h.object.userData.eggTarget === true);

export const SAIL_S = 9;
export const sailOffset = (s: number, out: { dx: number; dz: number }) => {
  const k = Math.sin(s * Math.PI);
  out.dx = k * 9;
  out.dz = -k * 5;
  return out;
};

export const FLASH_S = 1.2;
export const flashOn = (flash: number, t: number) => flash > 0 && Math.floor(t * 10) % 2 === 1;

export const WAVE_END = 8;
export const waveLift = (wave: number, seat: [number, number, number]) => {
  const ang = Math.atan2(seat[2] + 0.4, seat[0]);
  const ph = ((ang + Math.PI) / (Math.PI * 2)) * 6.3;
  return Math.max(0, 1 - Math.abs(wave - ph) * 1.6);
};

export const CHEER_S = 1.8;
export const cheerLift = (cheer: number, t: number, i: number) =>
  cheer > 0 ? Math.abs(Math.sin(t * 11 + i * 1.7)) * 0.13 : 0;
