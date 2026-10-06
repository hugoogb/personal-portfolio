// @vitest-environment jsdom
import * as THREE from "three";
import { beforeEach, describe, expect, it } from "vitest";
import { ORDER, PLACE_BY_ID } from "@/content/places";
import { stubCanvas } from "@/test/canvas";
import { createKit } from "@/world/kit/kit";
import { buildArena } from "@/world/places/arena";
import { buildDepartures } from "@/world/places/departures";
import { PLACE_BUILDERS } from "@/world/places/index";
import { buildStadium } from "@/world/places/stadium";

beforeEach(() => {
  stubCanvas();
});

describe("stadium", () => {
  it("has exactly the four floodlights the light budget allows", () => {
    const kit = createKit();
    buildStadium(kit);
    expect(kit.pointLights).toHaveLength(4);
    expect(kit.pointLights.every((l) => l instanceof THREE.PointLight)).toBe(true);
  });

  it("has players passing a ball", () => {
    const kit = createKit();
    buildStadium(kit);
    const ball = (kit.life as { pball?: THREE.Object3D }).pball;
    expect(ball).toBeDefined();
    const p0 = ball!.position.clone();
    for (let i = 0; i < 20; i++) kit.frame(0.1, i * 0.1, { night: 0, lit: 0, tier: 3 });
    expect(ball!.position.distanceTo(p0)).toBeGreaterThan(0);
  });
});

describe("arena", () => {
  it("stores the car, the ball and instanced egg fans for Phase 4", () => {
    const kit = createKit();
    buildArena(kit);
    const arena = kit.life.arena as { car: THREE.Object3D; ball: THREE.Object3D };
    expect(arena.car).toBeInstanceOf(THREE.Object3D);
    expect(arena.ball).toBeInstanceOf(THREE.Object3D);
    expect((kit.life.fans as { eggs: THREE.InstancedMesh }).eggs.isInstancedMesh).toBe(true);
  });
});

describe("departures and the harbour", () => {
  it("bobs the caravel and hides the straw hat on the beach", () => {
    const kit = createKit();
    const g = buildDepartures(kit);
    g.position.set(PLACE_BY_ID.board.map.x, 0, PLACE_BY_ID.board.map.z);
    g.updateMatrixWorld(true);
    const ship = (kit.life.ship as { g: THREE.Object3D }).g;
    const y0 = ship.position.y;
    kit.frame(0.1, 0.5, { night: 0, lit: 0, tier: 3 });
    expect(ship.position.y).not.toBe(y0);
    const hat = new THREE.Vector3();
    (kit.life.hat as THREE.Object3D).getWorldPosition(hat);
    expect(hat.x).toBeLessThan(-14);
    expect(hat.z).toBeGreaterThan(11);
  });
});

describe("PLACE_BUILDERS", () => {
  it("covers every place", () => {
    expect(Object.keys(PLACE_BUILDERS).sort()).toEqual([...ORDER].sort());
  });
});
