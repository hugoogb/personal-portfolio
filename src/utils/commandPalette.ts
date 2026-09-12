/**
 * Opening the palette from a button would otherwise mean lifting its state into
 * Layout and threading it down. A named event keeps the palette self-contained:
 * the keyboard shortcut and the navbar button are two ways of firing the same
 * thing.
 */
export const PALETTE_TOGGLE_EVENT = "palette:toggle";

export const toggleCommandPalette = () => {
  window.dispatchEvent(new Event(PALETTE_TOGGLE_EVENT));
};
