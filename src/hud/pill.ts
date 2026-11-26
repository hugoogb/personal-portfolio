import { STATUS_TARGETS } from "@/content/services";
import type { Place, PlaceId } from "@/content/types";
import type { StatusMap } from "@/store/store";

export type PillTone = "ok" | "down" | "unknown" | "pre" | "neutral";

const SERVICES = new Set<PlaceId>(STATUS_TARGETS.map((t) => t.id));

export const pillFor = (
  place: Place,
  status: StatusMap | "unknown",
): { text: string; tone: PillTone } => {
  if (place.preLaunch) return { text: place.pill, tone: "pre" };
  if (!SERVICES.has(place.id)) return { text: place.pill, tone: "neutral" };
  const s = status === "unknown" ? undefined : status[place.id];
  if (!s) return { text: "Status unavailable", tone: "unknown" };
  if (!s.ok) return { text: "Down", tone: "down" };
  return { text: s.ms === null ? "Live" : `Live · ${s.ms} ms`, tone: "ok" };
};

export const liveCount = (status: StatusMap | "unknown") =>
  status === "unknown"
    ? null
    : { ok: STATUS_TARGETS.filter((t) => status[t.id]?.ok).length, total: STATUS_TARGETS.length };
