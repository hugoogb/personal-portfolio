export const isTouchOnly = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  !window.matchMedia("(any-pointer: fine)").matches;
