export type Mode = "story" | "explore" | "text";
export const MODES: readonly Mode[] = ["story", "explore", "text"];

export const isMode = (v: unknown): v is Mode => MODES.includes(v as Mode);

/** One `mode-*` class on <html> drives the whole layout (spec 5.1). */
export const applyModeClass = (mode: Mode, root: HTMLElement = document.documentElement) => {
  root.classList.remove(...MODES.map((m) => `mode-${m}`));
  root.classList.add(`mode-${mode}`);
};

/** What the head script chose; Text when it chose nothing (dev, tests). */
export const readModeClass = (root: HTMLElement = document.documentElement): Mode =>
  MODES.find((m) => root.classList.contains(`mode-${m}`)) ?? "text";
