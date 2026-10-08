export type HudKey =
  | "next"
  | "prev"
  | "primary"
  | "secondary"
  | "tertiary"
  | "brief"
  | "console"
  | "escape";

export interface KeyLike {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
  target?: EventTarget | null;
}

const isField = (target: EventTarget | null | undefined) =>
  typeof HTMLElement !== "undefined" &&
  target instanceof HTMLElement &&
  (target.contentEditable === "true" ||
    target.isContentEditable ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

/**
 * The town's keyboard map (spec 4.2). Shortcuts never fire from form fields;
 * Escape and the console shortcut are the exceptions, so a dialog can always be left.
 */
export const keyAction = (e: KeyLike): HudKey | null => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") return "console";
  if (e.key === "Escape") return "escape";
  if (isField(e.target) || e.ctrlKey || e.metaKey || e.altKey) return null;
  switch (e.key) {
    case "ArrowRight":
    case "r":
    case "R":
      return "next";
    case "ArrowLeft":
      return "prev";
    case "q":
    case "Q":
      return "primary";
    case "w":
    case "W":
      return "secondary";
    case "e":
    case "E":
      return "tertiary";
    case "b":
    case "B":
      return "brief";
    default:
      return null;
  }
};
