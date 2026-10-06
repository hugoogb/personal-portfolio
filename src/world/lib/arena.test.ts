import { describe, expect, it } from "vitest";
import { AX, AZ, createArena, stepArena, type DriveInput } from "@/world/lib/arena";

const idle: DriveInput = { throttle: 0, steer: 0, boost: false, steerTo: null };
const run = (a = createArena(), input: DriveInput = idle, seconds = 1, dt = 1 / 60) => {
  const goals: string[] = [];
  for (let t = 0; t < seconds; t += dt) {
    const { goal } = stepArena(a, input, dt);
    if (goal) goals.push(goal);
  }
  return { a, goals };
};

describe("arena physics (spec 7)", () => {
  it("accelerates to the top speed, higher with boost", () => {
    const { a } = run(createArena(), { ...idle, throttle: 1 }, 0.5);
    expect(a.v).toBeGreaterThan(0);
    const cruise = run(createArena(), { ...idle, throttle: 1 }, 6).a;
    expect(Math.abs(cruise.v)).toBeLessThanOrEqual(4.6 + 1e-9);
    const boosted = createArena();
    boosted.cp.x = -2;
    let top = 0;
    for (let i = 0; i < 40; i++) {
      stepArena(boosted, { ...idle, throttle: 1, boost: true }, 1 / 60);
      top = Math.max(top, boosted.v);
    }
    expect(top).toBeGreaterThan(4.6);
    expect(top).toBeLessThanOrEqual(6.5 + 1e-9);
  });

  it("slows down without throttle", () => {
    const a = createArena();
    a.v = 3;
    run(a, idle, 1);
    expect(a.v).toBeLessThan(3);
  });

  it("keeps the car inside the walls", () => {
    const { a } = run(createArena(), { ...idle, throttle: 1, steer: 1 }, 10);
    expect(Math.abs(a.cp.x)).toBeLessThanOrEqual(AX - 0.36 + 1e-9);
    expect(Math.abs(a.cp.y)).toBeLessThanOrEqual(AZ - 0.3 + 1e-9);
  });

  it("knocks the ball when the car hits it", () => {
    const a = createArena();
    a.ball = { x: -0.8, z: 0 };
    a.cp = { x: -1.3, y: 0 };
    a.v = 3;
    run(a, { ...idle, throttle: 1 }, 0.3);
    expect(Math.hypot(a.bv.x, a.bv.y)).toBeGreaterThan(0.5);
  });

  it("bounces the ball off a side wall with restitution 0.8", () => {
    const a = createArena();
    a.ball = { x: 0, z: AZ - 0.31 };
    a.bv = { x: 0, y: 2 };
    stepArena(a, idle, 0.05);
    expect(a.bv.y).toBeLessThan(0);
  });

  it("scores once through the mouth, then resets after 1.1 s", () => {
    const a = createArena();
    a.cp = { x: -2, y: 1.2 };
    a.ball = { x: AX + 0.1, z: 0 };
    a.bv = { x: 3, y: 0 };
    const { goals } = run(a, idle, 0.5);
    expect(goals).toEqual(["Blue"]);
    expect(a.lock).toBeGreaterThan(0);
    run(a, idle, 1.2);
    expect(a.ball).toEqual({ x: 0, z: 0 });
    expect(a.cp).toEqual({ x: -1.3, y: 0 });
  });

  it("does not score outside the mouth", () => {
    const a = createArena();
    a.cp = { x: -2, y: 0 };
    a.ball = { x: AX - 0.35, z: 1.0 };
    a.bv = { x: 3, y: 0 };
    const { goals } = run(a, idle, 1);
    expect(goals).toEqual([]);
  });
});
