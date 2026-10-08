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
 * with everything else on the phone.
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
  if (s.gpuTier === 2) return s.cores >= 8 ? 3 : 2;
  if (s.gpuTier === 1) return 1;
  return s.cores <= 4 || memory <= 4 ? 2 : 3;
};

export const resolveTier = (mode: QualityMode, auto: Tier): Tier =>
  mode === "auto" ? auto : (TIER_NAMES.indexOf(mode) as Tier);

export const GOVERNOR = {
  graceSeconds: 4,
  windowSeconds: 2,
  minFps: 40,
  lowRunsToStep: 2,
  maxStepDowns: 3,
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
  introDone: boolean;
}

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
 * two slow two-second windows in a row, never during the grace period, never
 * below Low, never in manual mode, and at most three times.
 */
export const governorTick = (
  state: GovernorState,
  dt: number,
  ctx: GovernorContext,
): { state: GovernorState; stepDown: boolean } => {
  if (state.grace > 0) {
    return {
      state: { ...state, grace: Math.max(0, state.grace - dt), windowTime: 0, frames: 0 },
      stepDown: false,
    };
  }

  const windowTime = state.windowTime + dt;
  const frames = state.frames + 1;
  if (windowTime < GOVERNOR.windowSeconds) {
    return { state: { ...state, windowTime, frames }, stepDown: false };
  }

  const fps = frames / windowTime;
  const lowRuns = fps < GOVERNOR.minFps ? state.lowRuns + 1 : 0;
  const next: GovernorState = { ...state, windowTime: 0, frames: 0, fps, lowRuns };
  const stepDown =
    ctx.auto &&
    ctx.introDone &&
    ctx.tier > 1 &&
    lowRuns >= GOVERNOR.lowRunsToStep &&
    state.stepDowns < GOVERNOR.maxStepDowns;

  if (!stepDown) return { state: next, stepDown: false };
  return {
    state: { ...restartGrace(next), stepDowns: state.stepDowns + 1 },
    stepDown: true,
  };
};
