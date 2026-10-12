import { STATUS_TARGETS } from "@/content/services";
import type { PlaceId } from "@/content/types";
import type { StatusMap } from "@/store/store";

/** Night windows go dark only for a service confirmed down (spec 9.6). */
export const windowFactor = (status: StatusMap | "unknown", id: PlaceId) =>
  status !== "unknown" && status[id]?.ok === false ? 0 : 1;

export type YardState = { kind: "unknown" } | { kind: "known"; downShare: number };

/** The yard's health: the share of probed apps that are down (spec 9.6 yard LEDs). */
export const yardState = (status: StatusMap | "unknown"): YardState => {
  if (status === "unknown") return { kind: "unknown" };
  const ids = STATUS_TARGETS.map((t) => t.id).filter((id) => status[id]);
  if (!ids.length) return { kind: "unknown" };
  return {
    kind: "known",
    downShare: ids.filter((id) => status[id]!.ok === false).length / ids.length,
  };
};

/** The rack LED palette, the same on both rows (spec 6b). */
export const LED_PALETTE = (k: number) => (k < 0.5 ? "#4ade80" : k < 0.75 ? "#1a3a2a" : "#60a5fa");

/** One LED's colour: red for the down share, grey when unknown. */
export const ledColor = (state: YardState, r: number): string => {
  if (state.kind === "unknown") return r < 0.5 ? "#6b7280" : "#374151";
  if (r < state.downShare) return "#ef4444";
  return LED_PALETTE(state.downShare < 1 ? (r - state.downShare) / (1 - state.downShare) : r);
};
