export const ARRIVAL_S = 1.6;

/** A quick swell and a slow fade: 0 at the start, 1 at about 0.35 s, 0 again at ARRIVAL_S. */
export const arrivalPulse = (t: number) => {
  if (t <= 0 || t >= ARRIVAL_S) return 0;
  const rise = Math.min(1, t / 0.35);
  const fall = 1 - Math.max(0, (t - 0.35) / (ARRIVAL_S - 0.35));
  return Math.sin((rise * Math.PI) / 2) * fall * fall;
};
