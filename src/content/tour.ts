import { PLACES, PLACE_BY_ID } from "@/content/places";
import type { PlaceId } from "@/content/types";
import { CAMERA_OFFSET } from "@/world/lib/camera";
import { OVERVIEW } from "@/world/lib/map";

export type StopId = "top" | "about" | "f1" | "rl" | "wt" | "es" | "av" | "contact" | "overview";

/** Where the camera looks: ground target, view height in world units, and azimuth in degrees. */
export interface Pose {
  x: number;
  z: number;
  view: number;
  az: number;
}

export interface Stop {
  id: StopId;
  /** The section's id in the story document, and the URL hash. */
  anchor: string;
  place: PlaceId | null;
  label: string;
  /** Listed in the section rail. */
  rail: boolean;
  /** Where the card sits; the building is framed in the other half. */
  side: "left" | "right" | "center";
  pose: Pose;
  /** A phone's pose, where it differs: by default the desktop view times NARROW_ZOOM_OUT. */
  narrow?: Partial<Pose>;
}

/** Story only: the camera may swing this far around its target (spec 4.2). */
export const MAX_AZ = 20;
/** A phone is narrow: a card's building is framed this much wider than on desktop. */
const NARROW_ZOOM_OUT = 1.6;
/**
 * On a phone the building rides this far (of the view) above the centre: the card sheet
 * starts at 56% of the screen (story.css), so the building centres in the top 56%.
 */
const NARROW_LIFT = 0.22;
/** On desktop the building sits this far (of the view's width) toward the free half. */
const SIDE_SHIFT = 0.22;

type V3 = [number, number, number];
const norm = (v: V3): V3 => {
  const l = Math.hypot(v[0], v[1], v[2]);
  return [v[0] / l, v[1] / l, v[2] / l];
};
const cross = (a: V3, b: V3): V3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];

/** The camera's offset from its target, turned `az` degrees about the vertical axis. */
export const cameraOffset = (az: number): V3 => {
  const a = (az * Math.PI) / 180;
  const c = Math.cos(a);
  const s = Math.sin(a);
  const [x, y, z] = CAMERA_OFFSET;
  return [x * c + z * s, y, -x * s + z * c];
};

/**
 * How far to move the camera's ground target so the view slides by (right, up)
 * world units on screen, at azimuth `az`. A thing on the ground then appears
 * shifted by (-right, -up).
 */
export const groundShift = (right: number, up: number, az: number) => {
  const o = cameraOffset(az);
  const f = norm([-o[0], -o[1], -o[2]]);
  const r = norm(cross(f, [0, 1, 0]));
  const u = cross(r, f);
  const s: V3 = [r[0] * right + u[0] * up, r[1] * right + u[1] * up, r[2] * right + u[2] * up];
  const t = s[1] / f[1];
  return { x: s[0] - f[0] * t, z: s[2] - f[2] * t };
};

/** A ground point moved so it shows `up` world units higher on screen (at azimuth 0). */
const lift = (p: { x: number; z: number }, up: number) => {
  const d = groundShift(0, -up, 0);
  return { x: p.x + d.x, z: p.z + d.z };
};

const at = (id: PlaceId, view: number, az: number): Pose => ({
  x: PLACE_BY_ID[id].map.x,
  z: PLACE_BY_ID[id].map.z,
  view,
  az,
});

const project = (
  id: "f1" | "rl" | "wt" | "es" | "av",
  side: "left" | "right",
  az: number,
): Stop => ({
  id,
  anchor: PLACE_BY_ID[id].slug,
  place: id,
  label: PLACE_BY_ID[id].name,
  rail: true,
  side,
  pose: at(id, PLACE_BY_ID[id].map.zoom, az),
});

/** The tour, in document order (spec 3.1). Poses are tuned by eye. */
export const STOPS: Stop[] = [
  {
    id: "top",
    anchor: "top",
    place: "hq",
    label: "Hugo García Benjumea",
    rail: true,
    side: "center",
    pose: at("hq", 17, -10),
    narrow: { view: 17 },
  },
  {
    id: "about",
    anchor: PLACE_BY_ID.hq.slug,
    place: "hq",
    label: "About",
    rail: true,
    side: "left",
    pose: at("hq", 12, -6),
  },
  project("f1", "right", 12),
  project("rl", "left", -12),
  project("wt", "right", 10),
  project("es", "left", -10),
  project("av", "right", 14),
  {
    id: "contact",
    anchor: PLACE_BY_ID.post.slug,
    place: "post",
    label: "Contact",
    rail: true,
    side: "left",
    pose: at("post", 12, -6),
  },
  {
    id: "overview",
    anchor: "explore",
    place: null,
    label: "Explore the town",
    rail: false,
    side: "center",
    // Lifted a little, so the island clears the closing line and button below it.
    pose: { ...lift(OVERVIEW, 4.5), view: OVERVIEW.view * 2.4, az: 0 },
    // Phones: wide enough that the whole island fits the narrow screen.
    narrow: { view: OVERVIEW.view * 4 },
  },
];

export const RAIL_STOPS = STOPS.filter((s) => s.rail);
export const TOUR_PLACES = [...new Set(STOPS.flatMap((s) => (s.place ? [s.place] : [])))];
export const EXPLORE_ONLY_SLUGS = PLACES.filter((p) => !TOUR_PLACES.includes(p.id))
  .map((p) => p.slug)
  .sort();

/** A stop's pose for this screen: the building sits in the half the card leaves free. */
export const poseFor = (stop: Stop, narrow: boolean, aspect: number): Pose => {
  if (narrow) {
    // Phones: the card is a sheet below, so the building rides in the top 56%.
    const { x, z, az, view } = {
      ...stop.pose,
      view: stop.pose.view * NARROW_ZOOM_OUT,
      ...stop.narrow,
    };
    if (stop.side === "center") return { x, z, view, az };
    const d = groundShift(0, -view * NARROW_LIFT, az);
    return { x: x + d.x, z: z + d.z, view, az };
  }
  const { x, z, az, view } = stop.pose;
  if (stop.side === "center") return { x, z, view, az };
  const half = view * aspect * SIDE_SHIFT;
  const d = groundShift(stop.side === "left" ? -half : half, 0, az);
  return { x: x + d.x, z: z + d.z, view, az };
};

const smooth = (a: number, b: number, t: number) => {
  const k = Math.min(1, Math.max(0, (t - a) / (b - a)));
  return k * k * (3 - 2 * k);
};

/** The pose between stop `index` and the next, `fraction` of the way; it holds still near each stop. */
export const poseAt = (index: number, fraction: number, narrow: boolean, aspect: number): Pose => {
  const last = STOPS.length - 1;
  if (index < 0) return poseFor(STOPS[0], narrow, aspect);
  if (index >= last) return poseFor(STOPS[last], narrow, aspect);
  const a = poseFor(STOPS[index], narrow, aspect);
  const b = poseFor(STOPS[index + 1], narrow, aspect);
  const t = smooth(0.2, 0.8, fraction);
  if (t === 0) return a;
  if (t === 1) return b;
  return {
    x: a.x + (b.x - a.x) * t,
    z: a.z + (b.z - a.z) * t,
    view: a.view * Math.pow(b.view / a.view, t),
    az: a.az + (b.az - a.az) * t,
  };
};

/** The story section for a place: its own stop, or the nearest tour stop for explore-only places. */
export const stopIndexForPlace = (id: PlaceId): number => {
  const own = STOPS.findIndex((s) => s.place === id && s.id !== "top");
  if (own >= 0) return own;
  const { x, z } = PLACE_BY_ID[id].map;
  let best = 1;
  let bestD = Infinity;
  STOPS.forEach((s, i) => {
    if (!s.place || s.id === "top") return;
    const m = PLACE_BY_ID[s.place].map;
    const d = Math.hypot(m.x - x, m.z - z);
    if (d < bestD) [best, bestD] = [i, d];
  });
  return best;
};
