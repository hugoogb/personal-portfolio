/** Where the story is, read by the camera every frame (never React state, so scrolling never re-renders). */
export const progress = { index: 0, fraction: 0, cut: 0 };

export const measureCenters = (sections: { top: number; height: number }[]) =>
  sections.map((s) => s.top + s.height / 2);

export const stopProgress = (centers: number[], focusY: number) => {
  const last = centers.length - 1;
  if (last < 0 || focusY <= centers[0]) return { index: 0, fraction: 0 };
  if (focusY >= centers[last]) return { index: last, fraction: 0 };
  let i = 0;
  while (i < last && centers[i + 1] <= focusY) i++;
  return { index: i, fraction: (focusY - centers[i]) / (centers[i + 1] - centers[i]) };
};

export const currentStop = (p: { index: number; fraction: number }) =>
  p.index + (p.fraction >= 0.5 ? 1 : 0);
