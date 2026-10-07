const QUERY = "(prefers-reduced-motion: reduce)";

interface Shared {
  source: unknown;
  mq: MediaQueryList;
  reduced: boolean;
}
let shared: Shared | null = null;
const listeners = new Set<() => void>();

/** One MediaQueryList for the whole app, created on first use and kept current by its change event. */
const read = (): Shared | null => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return null;
  // A replaced matchMedia (tests, polyfills) starts a fresh query.
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

/** The visitor's reduced-motion preference: a cached read, current within one change event. */
export const prefersReducedMotion = () => read()?.reduced ?? false;

/** Calls `fn` when the preference changes (it can flip mid-visit); returns the unsubscribe. */
export const onMotionPreferenceChange = (fn: () => void) => {
  read();
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};

/** Forgets the shared query, for tests that swap matchMedia. */
export const resetMotionForTests = () => {
  shared = null;
  listeners.clear();
};
