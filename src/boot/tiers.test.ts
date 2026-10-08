import { describe, expect, it } from "vitest";
import {
  GOVERNOR,
  chooseTier,
  governorTick,
  initialGovernor,
  resolveTier,
  restartGrace,
  type GovernorContext,
  type GovernorState,
  type TierSignals,
} from "@/boot/tiers";

const desktop: TierSignals = {
  webgl: true,
  reducedMotion: false,
  saveData: false,
  gpuTier: 3,
  cores: 8,
  memoryGb: 16,
  coarsePointer: false,
};

describe("chooseTier", () => {
  it("gives a capable desktop High", () => {
    expect(chooseTier(desktop)).toBe(3);
  });

  it("gives a tier-2 GPU High only with 8 or more cores", () => {
    expect(chooseTier({ ...desktop, gpuTier: 2, cores: 8 })).toBe(3);
    expect(chooseTier({ ...desktop, gpuTier: 2, cores: 4 })).toBe(2);
  });

  it("gives a weak GPU Low", () => {
    expect(chooseTier({ ...desktop, gpuTier: 1 })).toBe(1);
  });

  it("starts touch devices at Medium, and old ones at Low", () => {
    expect(chooseTier({ ...desktop, coarsePointer: true, gpuTier: 3 })).toBe(2);
    expect(chooseTier({ ...desktop, coarsePointer: true, gpuTier: 1 })).toBe(1);
    expect(
      chooseTier({ ...desktop, coarsePointer: true, gpuTier: null, cores: 4, memoryGb: 3 }),
    ).toBe(1);
  });

  it.each([
    ["no WebGL", { webgl: false }],
    ["reduced motion", { reducedMotion: true }],
    ["Save-Data", { saveData: true }],
    ["GPU tier 0", { gpuTier: 0 as const }],
  ])("falls back to Lite with %s", (_label, override) => {
    expect(chooseTier({ ...desktop, ...override })).toBe(0);
  });

  it("guesses from cores and memory when the GPU is unknown", () => {
    expect(chooseTier({ ...desktop, gpuTier: null })).toBe(3);
    expect(chooseTier({ ...desktop, gpuTier: null, cores: 4 })).toBe(2);
    expect(chooseTier({ ...desktop, gpuTier: null, memoryGb: 4 })).toBe(2);
    expect(chooseTier({ ...desktop, gpuTier: null, memoryGb: null })).toBe(3);
  });
});

describe("resolveTier", () => {
  it("uses the automatic tier in auto mode and the named tier otherwise", () => {
    expect(resolveTier("auto", 2)).toBe(2);
    expect(resolveTier("High", 1)).toBe(3);
    expect(resolveTier("Lite", 3)).toBe(0);
  });
});

const live: GovernorContext = { auto: true, tier: 3, introDone: true };

/** Feeds `seconds` of frames at a steady `fps` and counts step-downs. */
const run = (start: GovernorState, fps: number, seconds: number, ctx = live) => {
  let state = start;
  let steps = 0;
  for (let i = 0; i < Math.round(fps * seconds); i++) {
    const result = governorTick(state, 1 / fps, ctx);
    state = result.state;
    if (result.stepDown) steps++;
  }
  return { state, steps };
};

const settled = (): GovernorState => ({ ...initialGovernor(), grace: 0 });

describe("governor", () => {
  it("ignores a slow start while shaders compile", () => {
    const { state, steps } = run(initialGovernor(), 20, GOVERNOR.graceSeconds);
    expect(steps).toBe(0);
    expect(state.grace).toBeLessThan(0.06);
  });

  it("steps down after two slow windows in a row", () => {
    const { state, steps } = run(settled(), 30, 4.5);
    expect(steps).toBe(1);
    expect(state.stepDowns).toBe(1);
    expect(state.grace).toBeGreaterThan(0);
  });

  it("does not step down when slow windows are not back to back", () => {
    const slow1 = run(settled(), 30, 2.2);
    const fast = run(slow1.state, 60, 2.2);
    const slow2 = run(fast.state, 30, 2.2);
    expect(slow1.steps + fast.steps + slow2.steps).toBe(0);
    expect(slow2.state.lowRuns).toBe(1);
  });

  it("never steps below Low", () => {
    expect(run(settled(), 20, 20, { ...live, tier: 1 }).steps).toBe(0);
  });

  it("does nothing in manual mode or before the build-in ends", () => {
    expect(run(settled(), 20, 20, { ...live, auto: false }).steps).toBe(0);
    expect(run(settled(), 20, 20, { ...live, introDone: false }).steps).toBe(0);
  });

  it("stops after three step-downs", () => {
    expect(run(settled(), 20, 60).steps).toBe(GOVERNOR.maxStepDowns);
  });

  it("measures fps at the end of each window", () => {
    const { state } = run(settled(), 50, 2.1);
    expect(state.fps).toBeGreaterThan(45);
    expect(state.fps).toBeLessThan(55);
  });

  it("restarts the grace period after a manual tier change", () => {
    const { state } = run(settled(), 30, 2.2);
    const restarted = restartGrace(state);
    expect(restarted.grace).toBe(GOVERNOR.graceSeconds);
    expect(restarted.lowRuns).toBe(0);
  });
});
