import { describe, expect, it } from "vitest";
import { buildRoutes, type RoutePlan } from "@/world/traffic/model";
import { TrafficSim } from "@/world/traffic/sim";

const route = buildRoutes().find((r) => r.id === "rl")!;
const plan = (over: Partial<RoutePlan> = {}): RoutePlan => ({
  route,
  rate: 2,
  speed: 2,
  down: false,
  ...over,
});
const run = (sim: TrafficSim, seconds: number, dt = 0.05) => {
  for (let t = 0; t < seconds; t += dt) sim.step(dt);
};

describe("TrafficSim", () => {
  it("spawns about rate x time requests, within the cap", () => {
    let spawned = 0;
    const sim = new TrafficSim([plan({ rate: 2, speed: 0.01 })], { req: 20, res: 10 }, () => 0);
    sim.onSpawn = () => spawned++;
    run(sim, 5);
    expect(spawned).toBeGreaterThanOrEqual(9);
    expect(spawned).toBeLessThanOrEqual(11);
    run(sim, 30);
    expect(sim.reqs.length).toBeLessThanOrEqual(20);
  });

  it("answers each arriving request with a response", () => {
    const sim = new TrafficSim([plan({ rate: 1 })], { req: 20, res: 10 }, () => 0.5);
    run(sim, 30);
    expect(sim.ress.length).toBeGreaterThan(0);
  });

  it("sends no responses for a down service, and pulses red at the yard", () => {
    const sim = new TrafficSim([plan({ rate: 1, down: true })], { req: 20, res: 10 }, () => 0.5);
    let downPulses = 0;
    sim.onPulse = (p) => {
      if (p.down) downPulses++;
    };
    run(sim, 30);
    expect(sim.ress.length).toBe(0);
    expect(downPulses).toBeGreaterThan(0);
  });

  it("spawns nothing with a zero cap (Lite)", () => {
    const sim = new TrafficSim([plan()], { req: 0, res: 0 });
    run(sim, 10);
    expect(sim.reqs.length + sim.ress.length).toBe(0);
  });

  it("shrinks to a lower tier's caps at once and keeps running", () => {
    const sim = new TrafficSim([plan({ rate: 2.5, speed: 0.2 })], { req: 20, res: 10 }, () => 0.5);
    run(sim, 20);
    expect(sim.reqs.length).toBeGreaterThan(10);
    sim.setCaps({ req: 10, res: 4 });
    expect(sim.reqs.length).toBeLessThanOrEqual(10);
    expect(sim.ress.length).toBeLessThanOrEqual(4);
    run(sim, 5);
    expect(sim.reqs.length).toBeLessThanOrEqual(10);
    sim.setCaps({ req: 0, res: 0 });
    run(sim, 1);
    expect(sim.reqs.length + sim.ress.length).toBe(0);
  });

  it("fades pulses out", () => {
    // One spawn near t = 1 s; at 1.5 s its pulse is half faded but alive.
    const sim = new TrafficSim([plan({ rate: 1 })], { req: 20, res: 10 }, () => 0);
    run(sim, 1.5);
    expect(sim.pulses.length).toBeGreaterThan(0);
    const quiet = new TrafficSim([plan({ rate: 0 })], { req: 20, res: 10 });
    quiet.pulses.push({ x: 0, z: 0, life: 1, down: false });
    run(quiet, 1);
    expect(quiet.pulses.length).toBe(0);
  });
});
