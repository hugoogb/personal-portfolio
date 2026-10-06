import type { HudMode } from "@/store/store";

/** Auto switches at the halfway point of the night amount (spec 5.3). */
export const hudTheme = (mode: HudMode, night: number): "light" | "dark" =>
  mode === "auto" ? (night > 0.5 ? "dark" : "light") : mode;
