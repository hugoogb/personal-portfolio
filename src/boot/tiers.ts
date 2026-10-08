export type Tier = 0 | 1 | 2 | 3;
export const TIER_NAMES = ["Lite", "Low", "Medium", "High"] as const;
export type TierName = (typeof TIER_NAMES)[number];
export type QualityMode = "auto" | TierName;

export interface TierSignals {
  webgl: boolean;
  reducedMotion: boolean;
  saveData: boolean;
  /** detect-gpu's tier, or null when the benchmark could not tell. */
  gpuTier: Tier | null;
  cores: number;
  memoryGb: number | null;
  coarsePointer: boolean;
}

/**
 * The starting tier (spec section 8). Lite means no 3D at all: no WebGL,
 * reduced motion, Save-Data, or a GPU the benchmark rates unusable. Touch
 * devices start at Medium at most, because their GPUs share power and heat
 * with everything else on the phone. High's ambient occlusion is a full-screen
 * pass every frame, so only a GPU the benchmark rates top tier starts there; a
 * GPU it does not know starts at Medium, which every tier-2 GPU holds at 60 fps.
 */
export const chooseTier = (s: TierSignals): Tier => {
  if (!s.webgl || s.reducedMotion || s.saveData || s.gpuTier === 0) return 0;
  const memory = s.memoryGb ?? 8;
  if (s.coarsePointer) {
    if (s.gpuTier === 1) return 1;
    if (s.gpuTier === null && s.cores <= 4 && memory <= 3) return 1;
    return 2;
  }
  if (s.gpuTier === 3) return 3;
  if (s.gpuTier === 1) return 1;
  return 2;
};

export const resolveTier = (mode: QualityMode, auto: Tier): Tier =>
  mode === "auto" ? auto : (TIER_NAMES.indexOf(mode) as Tier);

/**
 * Each tier's highest pixel ratio. High's ambient occlusion costs per pixel: at
 * 2 the effects alone took 28 ms a frame on an M4, and at 1.5 the night town
 * still missed frames. At 1.25 it holds 60 fps day and night (spec 8, 10).
 */
export const MAX_DPR: Record<Tier, number> = { 0: 1, 1: 1, 2: 1.5, 3: 1.25 };

/** Frames per second each tier is drawn at: Low at 30, the others at 60 even on a 120 Hz display. */
export const TARGET_FPS: Record<Tier, number> = { 0: 30, 1: 30, 2: 60, 3: 60 };

export const GOVERNOR = {
  graceSeconds: 3,
  windowSeconds: 1,
  minFps: 45,
  lowRunsToStep: 2,
  /** How far one step lowers Medium's pixel ratio, down to 1. */
  dprStep: 0.25,
  /** A frame longer than this is a pause (a shader compile, a hidden tab), not slowness. */
  pauseSeconds: 0.25,
} as const;

export interface GovernorState {
  /** Seconds left to ignore: shader compilation right after load or a tier change. */
  grace: number;
  windowTime: number;
  frames: number;
  /** Consecutive slow windows. */
  lowRuns: number;
  stepDowns: number;
  fps: number;
}

export interface GovernorContext {
  auto: boolean;
  tier: Tier;
  /** The pixel ratio the canvas draws at now: the cap, or the display's own if lower. */
  dpr: number;
  introDone: boolean;
}

/**
 * What a sustained slow patch costs, cheapest loss first: High gives up its
 * effects (Medium), Medium gives up resolution a quarter step at a time, and
 * at a pixel ratio of 1 it gives up shadows and half its frames (Low).
 */
export type GovernorStep = { kind: "tier"; tier: Tier } | { kind: "dpr"; dpr: number };

/** The ratio the canvas really draws at: on a 1x display every cap above 1 draws the same pixels. */
export const effectiveDpr = (cap: number, device: number) =>
  Math.min(cap, Math.max(1, device || 1));

export const nextStep = (tier: Tier, dpr: number): GovernorStep | null => {
  if (tier === 3) return { kind: "tier", tier: 2 };
  if (tier === 2 && dpr > 1) return { kind: "dpr", dpr: Math.max(1, dpr - GOVERNOR.dprStep) };
  if (tier === 2) return { kind: "tier", tier: 1 };
  return null;
};

export const initialGovernor = (): GovernorState => ({
  grace: GOVERNOR.graceSeconds,
  windowTime: 0,
  frames: 0,
  lowRuns: 0,
  stepDowns: 0,
  fps: 60,
});

export const restartGrace = (state: GovernorState): GovernorState => ({
  ...state,
  grace: GOVERNOR.graceSeconds,
  windowTime: 0,
  frames: 0,
  lowRuns: 0,
});

/**
 * One frame of the governor. It only lowers quality on sustained slowness:
 * two slow one-second windows in a row, never during the grace period, never
 * below Low, never in manual mode, and never back up. A pause restarts the
 * window it falls in.
 */
export const governorTick = (
  state: GovernorState,
  dt: number,
  ctx: GovernorContext,
): { state: GovernorState; step: GovernorStep | null } => {
  if (state.grace > 0) {
    return {
      state: { ...state, grace: Math.max(0, state.grace - dt), windowTime: 0, frames: 0 },
      step: null,
    };
  }

  if (dt > GOVERNOR.pauseSeconds) {
    return { state: { ...state, windowTime: 0, frames: 0 }, step: null };
  }

  const windowTime = state.windowTime + dt;
  const frames = state.frames + 1;
  if (windowTime < GOVERNOR.windowSeconds) {
    return { state: { ...state, windowTime, frames }, step: null };
  }

  const fps = frames / windowTime;
  const lowRuns = fps < GOVERNOR.minFps ? state.lowRuns + 1 : 0;
  const next: GovernorState = { ...state, windowTime: 0, frames: 0, fps, lowRuns };
  const step =
    ctx.auto && ctx.introDone && lowRuns >= GOVERNOR.lowRunsToStep
      ? nextStep(ctx.tier, ctx.dpr)
      : null;

  if (!step) return { state: next, step: null };
  return { state: { ...restartGrace(next), stepDowns: state.stepDowns + 1 }, step };
};
