// @vitest-environment jsdom
import * as THREE from "three";
import { beforeEach, describe, expect, it } from "vitest";
import { stubCanvas } from "@/test/canvas";
import { createKit } from "@/world/kit/kit";
import { CAPS, buildRoutes, laneEdges } from "@/world/traffic/model";
import { PIECES, buildTraffic } from "@/world/traffic/build";

beforeEach(() => {
  stubCanvas();
});

describe("buildTraffic", () => {
  it("is all instanced, shadowless and accent-painted", () => {
    const kit = createKit();
    const routes = buildRoutes();
    const t = buildTraffic(kit, routes);
    for (const m of [t.lanes, t.flows, t.rings]) {
      expect(m).toBeInstanceOf(THREE.InstancedMesh);
      expect(m.castShadow).toBe(false);
    }
    expect(t.lanes.count).toBe(laneEdges(routes).length * 2);
    expect(t.flows.count).toBe((CAPS[3].req + CAPS[3].res) * PIECES);
    expect(t.rings.count).toBe(16);
    expect(t.group.userData.dynamic).toBe(true);
    kit.paintAccent("#10b981");
    expect((t.flows.material as THREE.MeshBasicMaterial).color.getHexString()).toBe("10b981");
    expect((t.lanes.material as THREE.MeshBasicMaterial).color.getHexString()).toBe("10b981");
    kit.dispose();
  });

  it("carries the routes it was built from", () => {
    const kit = createKit();
    const t = buildTraffic(kit, buildRoutes());
    expect(t.routes).toEqual(buildRoutes());
    kit.dispose();
  });
});
