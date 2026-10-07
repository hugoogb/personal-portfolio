import * as THREE from "three";
import { describe, expect, it } from "vitest";
import { cheerLift, eggUnderPointer, flashOn, sailOffset, waveLift } from "@/world/lib/eggs";

describe("eggs", () => {
  it("sails out and back", () => {
    const out = { dx: 1, dz: 1 };
    expect(sailOffset(0, out)).toBe(out);
    expect(out.dx).toBeCloseTo(0, 9);
    expect(out.dz).toBeCloseTo(0, 9);
    sailOffset(0.5, out);
    expect(out.dx).toBeCloseTo(9, 6);
    expect(out.dz).toBeCloseTo(-5, 6);
    sailOffset(1, out);
    expect(out.dx).toBeCloseTo(0, 6);
  });

  it("flashes the cars at 10 Hz for the flash's duration", () => {
    expect(flashOn(0, 0.15)).toBe(false);
    const states = [0.05, 0.15, 0.25, 0.35].map((t) => flashOn(1, t));
    expect(states).toContain(true);
    expect(states).toContain(false);
  });

  it("lifts the seats the wave is passing, and nothing else", () => {
    const seat: [number, number, number] = [1, 0.5, 0];
    const lifts = Array.from({ length: 80 }, (_, i) => waveLift(i * 0.1, seat));
    expect(Math.max(...lifts)).toBeGreaterThan(0.9);
    expect(Math.min(...lifts)).toBe(0);
  });

  it("makes the fans jump only while cheering", () => {
    expect(cheerLift(0, 1, 3)).toBe(0);
    expect(cheerLift(1, 1, 3)).toBeGreaterThanOrEqual(0);
    expect(cheerLift(1, 1, 3)).toBeLessThanOrEqual(0.13);
  });
});

describe("egg targets inside a place's hit volume", () => {
  it("are found in the ray's intersections even when the place volume is nearer", () => {
    const place = new THREE.Mesh(new THREE.CylinderGeometry(5.3, 5.3, 1.6, 16));
    place.position.set(-11, 0.8, -8.6);
    const egg = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 6));
    egg.userData.eggTarget = true;
    egg.position.set(-11, 0.2, -8.6);
    for (const m of [place, egg]) m.updateMatrixWorld(true);
    const ray = new THREE.Raycaster(new THREE.Vector3(-11, 5, -8.6), new THREE.Vector3(0, -1, 0));
    const hits = ray.intersectObjects([place, egg]);
    expect(hits[0].object).toBe(place);
    expect(eggUnderPointer(hits)).toBe(true);
    expect(eggUnderPointer(ray.intersectObjects([place]))).toBe(false);
  });
});
