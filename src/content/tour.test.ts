import { describe, expect, it } from "vitest";
import { PLACES, PLACE_BY_ID } from "@/content/places";
import {
  EXPLORE_ONLY_SLUGS,
  MAX_AZ,
  RAIL_STOPS,
  STOPS,
  cameraOffset,
  groundShift,
  poseAt,
  poseFor,
  stopIndexForPlace,
} from "@/content/tour";
import { CAMERA_OFFSET } from "@/world/lib/camera";

describe("tour", () => {
  it("runs landing, about, the five projects, contact, then the overview", () => {
    expect(STOPS.map((s) => s.id)).toEqual([
      "top",
      "about",
      "f1",
      "rl",
      "wt",
      "es",
      "av",
      "contact",
      "overview",
    ]);
    expect(RAIL_STOPS.map((s) => s.id)).not.toContain("overview");
    expect(RAIL_STOPS).toHaveLength(8);
  });

  it("uses each place's slug as the section anchor", () => {
    for (const s of STOPS)
      if (s.place && s.id !== "top") expect(s.anchor).toBe(PLACE_BY_ID[s.place].slug);
    expect(new Set(STOPS.map((s) => s.anchor)).size).toBe(STOPS.length);
  });

  it("lists every non-tour place as explore-only", () => {
    const tour = new Set(STOPS.map((s) => s.place));
    expect(EXPLORE_ONLY_SLUGS.sort()).toEqual(
      PLACES.filter((p) => !tour.has(p.id))
        .map((p) => p.slug)
        .sort(),
    );
  });

  it("keeps every pose's azimuth within the limit", () => {
    for (const s of STOPS) expect(Math.abs(s.pose.az)).toBeLessThanOrEqual(MAX_AZ);
  });

  it("gives the fixed isometric offset at azimuth 0", () => {
    cameraOffset(0).forEach((v, i) => expect(v).toBeCloseTo(CAMERA_OFFSET[i]));
  });

  it("rotates the offset about Y without changing its height or length", () => {
    const o = cameraOffset(20);
    expect(o[1]).toBeCloseTo(CAMERA_OFFSET[1]);
    expect(Math.hypot(o[0], o[2])).toBeCloseTo(Math.hypot(CAMERA_OFFSET[0], CAMERA_OFFSET[2]));
  });

  it("moves the ground under a screen-right shift along the camera's right", () => {
    const a = groundShift(1, 0, 0);
    expect(Math.hypot(a.x, a.z)).toBeCloseTo(1);
    const b = groundShift(0, 1, 0);
    expect(Math.hypot(b.x, b.z)).toBeGreaterThan(1); // up the screen is foreshortened on the ground
  });

  it("puts a left-side card's building right of centre on desktop", () => {
    const stop = STOPS.find((s) => s.side === "left")!;
    const pose = poseFor(stop, false, 16 / 9);
    const place = PLACE_BY_ID[stop.place!].map;
    // Moving the target opposite the building's screen side: target - place lies along -right.
    const right = groundShift(1, 0, pose.az);
    const d = (pose.x - place.x) * right.x + (pose.z - place.z) * right.z;
    expect(d).toBeLessThan(0);
  });

  it("holds each stop's pose near its centre and blends between stops", () => {
    const a = poseFor(STOPS[2], false, 1.6);
    const b = poseFor(STOPS[3], false, 1.6);
    expect(poseAt(2, 0.1, false, 1.6)).toEqual(a);
    expect(poseAt(2, 0.9, false, 1.6)).toEqual(b);
    const mid = poseAt(2, 0.5, false, 1.6);
    expect(mid.x).toBeCloseTo((a.x + b.x) / 2);
    expect(mid.view).toBeCloseTo(Math.sqrt(a.view * b.view));
  });

  it("clamps out-of-range indices to the first and last stop", () => {
    expect(poseAt(-3, 0, false, 1.6)).toEqual(poseFor(STOPS[0], false, 1.6));
    expect(poseAt(99, 0.5, false, 1.6)).toEqual(poseFor(STOPS[STOPS.length - 1], false, 1.6));
  });

  it("maps tour places to their stop and the others to the nearest stop", () => {
    expect(STOPS[stopIndexForPlace("rl")].id).toBe("rl");
    expect(STOPS[stopIndexForPlace("hq")].id).toBe("about");
    expect(STOPS[stopIndexForPlace("post")].id).toBe("contact");
    const yard = stopIndexForPlace("yard");
    expect(STOPS[yard].place).not.toBeNull();
    expect(STOPS[yard].id).not.toBe("top");
  });
});
