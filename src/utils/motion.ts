const QUERY = "(prefers-reduced-motion: reduce)";

interface Shared {
  source: unknown;
  mq: MediaQueryList;
  reduced: boolean;
}
let shared: Shared | null = null;
const listeners = new Set<() => void>();

const read = (): Shared | null => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return null;
  if (shared && shared.source === window.matchMedia) return shared;
  const mq = window.matchMedia(QUERY);
  const s: Shared = { source: window.matchMedia, mq, reduced: mq.matches };
  mq.addEventListener?.("change", () => {
    s.reduced = mq.matches;
    for (const fn of [...listeners]) fn();
  });
  shared = s;
  return s;
};

export const prefersReducedMotion = () => read()?.reduced ?? false;

export const onMotionPreferenceChange = (fn: () => void) => {
  read();
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};

export const resetMotionForTests = () => {
  shared = null;
  listeners.clear();
};
