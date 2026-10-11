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

/** Each tour section's centre in page coordinates, measured on the layout on screen. */
export const readCenters = (sections: HTMLElement[]) =>
  measureCenters(
    sections.map((el) => ({
      top: el.getBoundingClientRect().top + window.scrollY,
      height: el.offsetHeight,
    })),
  );

export const storySections = () => [
  ...document.querySelectorAll<HTMLElement>("#story > section[data-stop]"),
];

/**
 * The stop at the middle of the screen now, or null with no story on the page. Sections
 * the layout hides (Text has no finale) are skipped: a hidden box would measure at the top.
 */
export const stopInView = (): number | null => {
  const shown = storySections()
    .map((el, i) => ({ el, i }))
    .filter(({ el }) => el.getClientRects().length > 0);
  if (!shown.length) return null;
  const p = stopProgress(
    readCenters(shown.map((s) => s.el)),
    window.scrollY + window.innerHeight / 2,
  );
  return shown[currentStop(p)]!.i;
};
