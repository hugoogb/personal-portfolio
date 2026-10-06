import { useBarcelonaHour } from "@/hooks/useBarcelonaHour";
import { useBaseCamp, type HudMode } from "@/store/store";
import { nightAmount } from "@/world/lib/sun";

/** Auto switches at the halfway point of the night amount (spec 5.3). */
export const hudTheme = (mode: HudMode, night: number): "light" | "dark" =>
  mode === "auto" ? (night > 0.5 ? "dark" : "light") : mode;

export const useHudTheme = () => {
  const mode = useBaseCamp((s) => s.hudMode);
  const hour = useBarcelonaHour();
  return hudTheme(mode, nightAmount(hour));
};
