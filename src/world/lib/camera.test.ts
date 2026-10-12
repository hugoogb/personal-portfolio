import { describe, expect, it } from "vitest";
import {
  VIEW_MAX,
  VIEW_MIN,
  clampTarget,
  clampView,
  damp,
  frameFor,
  panDelta,
  viewPolygon,
  wheelZoom,
  zoomFor,
} from "@/world/lib/camera";

describe("camera", () => {
  it("clamps the view height to the spec's range", () => {
    expect(clampView(1)).toBe(VIEW_MIN);
    expect(clampView(99)).toBe(VIEW_MAX);
    expect(clampView(12)).toBe(12);
  });

  it("keeps the target on the island", () => {
    expect(clampTarget(100, -100)).toEqual({ x: 16, z: -12 });
    expect(clampTarget(3, 4)).toEqual({ x: 3, z: 4 });
  });

  it("damps toward the goal, and jumps when motion is reduced", () => {
    expect(damp(0, 10, 6, 0)).toBe(0);
    const mid = damp(0, 10, 6, 0.1);
    expect(mid).toBeGreaterThan(0);
    expect(mid).toBeLessThan(10);
    expect(damp(0, 10, 6, 10)).toBeCloseTo(10, 6);
    expect(damp(0, 10, Infinity, 0)).toBe(10);
  });

  it("turns a view height into an orthographic zoom", () => {
    expect(zoomFor(10, 800)).toBe(80);
  });

  it("zooms out on a positive wheel delta, within the range", () => {
    expect(wheelZoom(12, 100)).toBeGreaterThan(12);
    expect(wheelZoom(12, -100)).toBeLessThan(12);
    expect(wheelZoom(39, 10_000)).toBe(VIEW_MAX);
  });

  it("moves along the screen's right for a horizontal drag", () => {
    const d = panDelta(100, 0, 10, 1000);
    expect(d.x).toBeCloseTo(-d.z, 6);
    expect(d.x).toBeGreaterThan(0);
    expect(Math.hypot(d.x, d.z)).toBeCloseTo(1, 6);
  });

  it("moves toward the camera for a downward drag, scaled by the view", () => {
    const d = panDelta(0, 100, 10, 1000);
    expect(d.x).toBeCloseTo(d.z, 6);
    expect(d.x).toBeGreaterThan(0);
    const wider = panDelta(0, 100, 20, 1000);
    expect(wider.x).toBeCloseTo(d.x * 2, 6);
  });

  it("frames a place, higher on narrow screens to clear the bottom sheet", () => {
    const map = { x: 3, z: -3, zoom: 12 };
    expect(frameFor(map, false)).toEqual({ x: 3, z: -3, view: 12 });
    const narrow = frameFor(map, true);
    expect(narrow.view).toBe(12);
    expect(narrow.x).toBeGreaterThan(3);
    expect(narrow.z).toBeGreaterThan(-3);
  });

  it("outlines the visible ground around the target", () => {
    const poly = viewPolygon(2, -1, 10, 1.5);
    expect(poly).toHaveLength(4);
    const cx = poly.reduce((s, p) => s + p.x, 0) / 4;
    const cz = poly.reduce((s, p) => s + p.z, 0) / 4;
    expect(cx).toBeCloseTo(2, 6);
    expect(cz).toBeCloseTo(-1, 6);
  });
});
