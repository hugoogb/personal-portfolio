/**
 * True when no input can hover or point finely: a phone, or a tablet with no
 * trackpad. These devices have no keyboard to count on, so anything that needs
 * keys (driving the arena car: reverse and boost are key-only) is not offered.
 * A touch laptop still has its trackpad, so it is not touch-only.
 */
export const isTouchOnly = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  !window.matchMedia("(any-pointer: fine)").matches;
