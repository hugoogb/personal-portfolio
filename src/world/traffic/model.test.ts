import { describe, expect, it } from "vitest";
import { SERVICES } from "@/content/services";
import {
  CAPS,
  DOORS,
  PROFILES,
  YARD_GATE,
  YARD_TARGET,
  buildRoutes,
  laneEdges,
  packetSpeed,
  planRoutes,
  pointAt,
  requestsPerSecond,
} from "@/world/traffic/model";

describe("routes", () => {
  it("runs one route per app from its door along the roads into the yard", () => {
    const routes = buildRoutes();
    expect(routes.map((r) => r.id).sort()).toEqual(SERVICES.map((s) => s.id).sort());
    for (const r of routes) {
      expect(r.path[0]).toEqual(DOORS[r.id]);
      expect(r.path[r.path.length - 2]).toEqual(YARD_GATE);
      expect(r.path[r.path.length - 1]).toEqual(YARD_TARGET);
      for (let i = 1; i < r.path.length - 1; i++) {
        const [a, b] = [r.path[i - 1], r.path[i]];
        expect(Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1])).toBe(1);
      }
    }
  });

  it("draws one lane per road edge any request uses", () => {
    const edges = laneEdges(buildRoutes());
    const keys = edges.map(([a, b]) => `${a}>${b}`);
    expect(new Set(keys).size).toBe(keys.length);
    expect(edges.length).toBeGreaterThan(10);
  });

  it("offsets a packet onto the right-hand lane", () => {
    const p = pointAt(
      [
        [0, 0],
        [1, 0],
      ],
      0.5,
    );
    expect(p.x).toBeCloseTo(0.5, 6);
    expect(Math.abs(p.z)).toBeCloseTo(0.22, 6);
  });
});

describe("rates", () => {
  it("log-scales request rate and caps it", () => {
    expect(requestsPerSecond(0)).toBe(0);
    expect(requestsPerSecond(10)).toBeGreaterThan(requestsPerSecond(1));
    expect(requestsPerSecond(1e9)).toBe(2.5);
  });

  it("slows packets for slow apps, within readable bounds", () => {
    expect(packetSpeed(20)).toBeGreaterThan(packetSpeed(2000));
    expect(packetSpeed(0)).toBeLessThanOrEqual(3);
    expect(packetSpeed(1e9)).toBeGreaterThanOrEqual(1.2);
  });

  it("gives every app a profile that actually sends packets", () => {
    for (const id of Object.keys(DOORS) as (keyof typeof DOORS)[]) {
      expect(requestsPerSecond(PROFILES[id].rpm), id).toBeGreaterThan(0);
    }
  });

  it("caps packets per tier (spec 6b)", () => {
    expect(CAPS[3]).toEqual({ req: 20, res: 10 });
    expect(CAPS[2]).toEqual({ req: 20, res: 10 });
    expect(CAPS[1]).toEqual({ req: 10, res: 4 });
    expect(CAPS[0]).toEqual({ req: 0, res: 0 });
  });
});

describe("planRoutes", () => {
  const routes = buildRoutes();

  it("follows each app's profile, in route order", () => {
    const plans = planRoutes(routes, "unknown");
    plans.forEach((p, i) => {
      expect(p.route).toBe(routes[i]);
      expect(p.rate).toBe(requestsPerSecond(PROFILES[p.route.id].rpm));
      expect(p.speed).toBe(packetSpeed(PROFILES[p.route.id].p50));
      expect(p.down).toBe(false);
    });
  });

  it("marks only a confirmed-down service as down", () => {
    const plans = planRoutes(routes, { f1: { ok: false, ms: null }, rl: { ok: true, ms: 9 } });
    expect(plans.find((p) => p.route.id === "f1")!.down).toBe(true);
    expect(plans.find((p) => p.route.id === "rl")!.down).toBe(false);
    expect(plans.find((p) => p.route.id === "hq")!.down).toBe(false);
  });
});
