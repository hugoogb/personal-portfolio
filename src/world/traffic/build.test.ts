// @vitest-environment jsdom
import * as THREE from "three";
import { beforeEach, describe, expect, it } from "vitest";
import { stubCanvas } from "@/test/canvas";
import { createKit } from "@/world/kit/kit";
import { buildRoutes, laneEdges } from "@/world/traffic/model";
import { buildTraffic } from "@/world/traffic/build";

beforeEach(() => {
  stubCanvas();
});

describe("buildTraffic", () => {
  it("is all instanced, shadowless and accent-painted", () => {
    const kit = createKit();
    const routes = buildRoutes();
    const t = buildTraffic(kit, routes);
    for (const m of [t.lanes, t.req, t.reqTrail, t.res, t.resTrail, t.rings]) {
      expect(m).toBeInstanceOf(THREE.InstancedMesh);
      expect(m.castShadow).toBe(false);
    }
    expect(t.lanes.count).toBe(laneEdges(routes).length);
    expect(t.req.count).toBe(20);
    expect(t.res.count).toBe(10);
    expect(t.rings.count).toBe(16);
    expect(t.group.userData.dynamic).toBe(true);
    kit.paintAccent("#10b981");
    expect((kit.life.packetMat as THREE.MeshStandardMaterial).color.getHexString()).toBe("10b981");
    expect((t.res.material as THREE.MeshBasicMaterial).color.getHexString()).toBe("4ade80");
    kit.dispose();
  });

  it("carries the routes it was built from", () => {
    const kit = createKit();
    const t = buildTraffic(kit, buildRoutes());
    expect(t.routes).toEqual(buildRoutes());
    kit.dispose();
  });
});
