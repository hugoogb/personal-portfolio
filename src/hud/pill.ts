import { STATUS_TARGETS } from "@/content/services";
import type { Place, PlaceId } from "@/content/types";
import type { StatusMap } from "@/store/store";

export type PillTone = "ok" | "down" | "unknown" | "pre" | "neutral";

const SERVICES = new Set<PlaceId>(STATUS_TARGETS.map((t) => t.id));

/** The card pill (spec 9.6): real status for services, the place's own words otherwise. */
export const pillFor = (place: Place, status: StatusMap | "unknown") => {
  if (place.preLaunch) return { text: place.pill, tone: "pre" as PillTone };
  if (!SERVICES.has(place.id)) return { text: place.pill, tone: "neutral" as PillTone };
  const s = status === "unknown" ? undefined : status[place.id];
  if (!s) return { text: "Status unavailable", tone: "unknown" as PillTone };
  if (!s.ok) return { text: "Down", tone: "down" as PillTone };
  return { text: s.ms === null ? "Live" : `Live · ${s.ms} ms`, tone: "ok" as PillTone };
};

/** "Live k/n" counts only what is confirmed ok; null means no data yet (shown as "-"). */
export const liveCount = (status: StatusMap | "unknown") =>
  status === "unknown"
    ? null
    : { ok: STATUS_TARGETS.filter((t) => status[t.id]?.ok).length, total: STATUS_TARGETS.length };
