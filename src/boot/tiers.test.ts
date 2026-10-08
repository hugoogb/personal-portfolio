import { describe, expect, it } from "vitest";
import {
  GOVERNOR,
  MAX_DPR,
  chooseTier,
  effectiveDpr,
  governorTick,
  initialGovernor,
  nextStep,
  resolveTier,
  restartGrace,
  type GovernorContext,
  type GovernorState,
  type GovernorStep,
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

  it("gives a tier-2 GPU Medium, however many cores it has", () => {
    expect(chooseTier({ ...desktop, gpuTier: 2, cores: 16 })).toBe(2);
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

  it("starts a desktop with an unknown GPU at Medium", () => {
    expect(chooseTier({ ...desktop, gpuTier: null })).toBe(2);
    expect(chooseTier({ ...desktop, gpuTier: null, cores: 4, memoryGb: 4 })).toBe(2);
    expect(chooseTier({ ...desktop, gpuTier: null, memoryGb: null })).toBe(2);
  });
});

describe("resolveTier", () => {
  it("uses the automatic tier in auto mode and the named tier otherwise", () => {
    expect(resolveTier("auto", 2)).toBe(2);
    expect(resolveTier("High", 1)).toBe(3);
    expect(resolveTier("Lite", 3)).toBe(0);
  });
});

const live: GovernorContext = { auto: true, tier: 3, dpr: MAX_DPR[3], introDone: true };

/**
 * Feeds `seconds` of frames at a steady `fps` and applies each step the way the
 * Governor component does: a tier step resets the pixel ratio to the tier's.
 */
const run = (start: GovernorState, fps: number, seconds: number, from = live) => {
  let state = start;
  let ctx = from;
  const steps: GovernorStep[] = [];
  for (let i = 0; i < Math.round(fps * seconds); i++) {
    const result = governorTick(state, 1 / fps, ctx);
    state = result.state;
    const step = result.step;
    if (!step) continue;
    steps.push(step);
    ctx =
      step.kind === "tier"
        ? { ...ctx, tier: step.tier, dpr: MAX_DPR[step.tier] }
        : { ...ctx, dpr: step.dpr };
  }
  return { state, steps, ctx };
};

const settled = (): GovernorState => ({ ...initialGovernor(), grace: 0 });

describe("governor", () => {
  it("ignores a slow start while shaders compile", () => {
    const { state, steps } = run(initialGovernor(), 20, GOVERNOR.graceSeconds);
    expect(steps).toEqual([]);
    expect(state.grace).toBeLessThan(0.06);
  });

  it("steps down after two slow one-second windows in a row", () => {
    const { state, steps } = run(settled(), 30, 2.2);
    expect(steps).toEqual([{ kind: "tier", tier: 2 }]);
    expect(state.stepDowns).toBe(1);
    expect(state.grace).toBeGreaterThan(0);
  });

  it("does not step down when slow windows are not back to back", () => {
    const slow1 = run(settled(), 30, 1.1);
    const fast = run(slow1.state, 60, 1.1);
    const slow2 = run(fast.state, 30, 1.1);
    expect([...slow1.steps, ...fast.steps, ...slow2.steps]).toEqual([]);
    expect(slow2.state.lowRuns).toBe(1);
  });

  it("gives up effects first, then Medium's resolution a quarter at a time, then shadows", () => {
    const { steps, ctx } = run(settled(), 20, 60);
    expect(steps).toEqual([
      { kind: "tier", tier: 2 },
      { kind: "dpr", dpr: 1.25 },
      { kind: "dpr", dpr: 1 },
      { kind: "tier", tier: 1 },
    ]);
    expect(ctx.tier).toBe(1);
  });

  it("on a 1x display, goes from Medium straight to Low: its ratio steps would change nothing", () => {
    const ctx = { ...live, tier: 2 as const, dpr: effectiveDpr(MAX_DPR[2], 1) };
    expect(run(settled(), 20, 2.2, ctx).steps).toEqual([{ kind: "tier", tier: 1 }]);
    expect(effectiveDpr(1.5, 2)).toBe(1.5);
    expect(effectiveDpr(1.5, 1.25)).toBe(1.25);
    expect(effectiveDpr(1.5, 0)).toBe(1);
  });

  it("never steps below Low", () => {
    expect(run(settled(), 20, 20, { ...live, tier: 1, dpr: 1 }).steps).toEqual([]);
    expect(nextStep(1, 1)).toBeNull();
    expect(nextStep(0, 1)).toBeNull();
  });

  it("does nothing in manual mode or before the build-in ends", () => {
    expect(run(settled(), 20, 20, { ...live, auto: false }).steps).toEqual([]);
    expect(run(settled(), 20, 20, { ...live, introDone: false }).steps).toEqual([]);
  });

  it("holds 60 fps targets steady at 50 fps", () => {
    expect(run(settled(), 50, 10).steps).toEqual([]);
  });

  it("reads a long frame as a pause, not as a slow window", () => {
    let state = run(settled(), 30, 1.05).state;
    expect(state.lowRuns).toBe(1);
    // Ten seconds held for a shader compile, then fast frames again.
    state = governorTick(state, 10, live).state;
    expect(state.windowTime).toBe(0);
    const after = run(state, 60, 2.2);
    expect(after.steps).toEqual([]);
    expect(after.state.lowRuns).toBe(0);
  });

  it("measures fps at the end of each window", () => {
    const { state } = run(settled(), 50, 1.05);
    expect(state.fps).toBeGreaterThan(45);
    expect(state.fps).toBeLessThan(55);
  });

  it("restarts the grace period after a manual tier change", () => {
    const { state } = run(settled(), 30, 1.1);
    const restarted = restartGrace(state);
    expect(restarted.grace).toBe(GOVERNOR.graceSeconds);
    expect(restarted.lowRuns).toBe(0);
  });
});
