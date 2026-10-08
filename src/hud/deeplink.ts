import { placeBySlug } from "@/content/places";
import type { PlaceId } from "@/content/types";

export type HashTarget =
  | { type: "place"; id: PlaceId }
  | { type: "brief"; anchor: string | null }
  | null;

/** Section ids that only exist in the Brief (spec 4.5); #about and #contact are places. */
const BRIEF_ANCHORS = new Set(["brief", "work", "stack"]);

/** What a URL hash asks for. Case is ignored, so old capitalised links still land. */
export const hashTarget = (hash: string): HashTarget => {
  const slug = hash.replace(/^#/, "").toLowerCase();
  if (!slug) return null;
  if (BRIEF_ANCHORS.has(slug)) return { type: "brief", anchor: slug === "brief" ? null : slug };
  const place = placeBySlug(slug);
  return place ? { type: "place", id: place.id } : null;
};
