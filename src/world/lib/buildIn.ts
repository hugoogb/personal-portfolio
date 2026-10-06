export const BUILD_IN_S = 1.95;
/** When the camera starts easing from the overview to its place. */
export const CAMERA_AT_S = 0.9;
/** The overview's view height at the start of the build-in. */
export const OVERVIEW_VIEW = 52;
/** Props (trees, lamps, homes, cars) are grouped into rings by distance from the crossroads. */
export const PROP_RINGS = 6;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeBack = (t: number) => {
  const c1 = 1.5;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

export const groundY = (t: number) => -2.2 + 2.2 * easeOut(clamp01(t / 0.45));

export const roadScale = (t: number) => Math.max(0.001, easeOut(clamp01((t - 0.3) / 0.45)));

/** Places scale up from HQ outward (delay grows with distance from (-3, -3)). */
export const placeScale = (t: number, x: number, z: number) => {
  const delay = 0.5 + Math.hypot(x + 3, z + 3) * 0.03;
  return Math.max(0.001, easeBack(clamp01((t - delay) / 0.5)));
};

export const ringOf = (x: number, z: number) =>
  Math.min(PROP_RINGS - 1, Math.floor(Math.hypot(x, z) / 4));

/** A prop ring's y offset: below ground, then up with a small overshoot. */
export const ringRise = (t: number, ring: number) => {
  const delay = 0.8 + ring * 4 * 0.025;
  return (easeBack(clamp01((t - delay) / 0.35)) - 1) * 2.4;
};
