/** Where the story is, read by the camera every frame (never React state, so scrolling never re-renders). */
export const progress = { index: 0, fraction: 0, cut: 0 };

export const measureCenters = (sections: { top: number; height: number }[]) =>
  sections.map((s) => s.top + s.height / 2);

/**
 * Where each stop is reached, as the page y that sits at the middle of the screen. A
 * section no taller than the screen is reached centred; a taller one (a phone card
 * sheet) when its top meets the top of the screen, so its building is in view first
 * and the card is then read while the camera holds. Anchor jumps land there too.
 */
export const measureStops = (sections: { top: number; height: number }[], viewportH: number) =>
  sections.map((s) => s.top + Math.min(s.height, viewportH) / 2);

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

/** Each tour section's stop line (measureStops) in page coordinates, on the layout on screen. */
export const readStops = (sections: HTMLElement[]) =>
  measureStops(
    sections.map((el) => ({
      top: el.getBoundingClientRect().top + window.scrollY,
      height: el.offsetHeight,
    })),
    window.innerHeight,
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
    readStops(shown.map((s) => s.el)),
    window.scrollY + window.innerHeight / 2,
  );
  return shown[currentStop(p)]!.i;
};
