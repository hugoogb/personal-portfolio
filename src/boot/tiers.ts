export type Tier = 0 | 1 | 2 | 3;
export const TIER_NAMES = ["Lite", "Low", "Medium", "High"] as const;
export type TierName = (typeof TIER_NAMES)[number];
export type QualityMode = "auto" | TierName;

export interface TierSignals {
  webgl: boolean;
  reducedMotion: boolean;
  saveData: boolean;
  gpuTier: Tier | null;
  cores: number;
  memoryGb: number | null;
  coarsePointer: boolean;
}

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

export const MAX_DPR: Record<Tier, number> = { 0: 1, 1: 1, 2: 1.5, 3: 1.25 };

export const TARGET_FPS: Record<Tier, number> = { 0: 30, 1: 30, 2: 60, 3: 60 };

export const IDLE_FPS = 30;

export const GOVERNOR = {
  graceSeconds: 3,
  windowSeconds: 1,
  minFps: 45,
  lowRunsToStep: 2,
  dprStep: 0.25,
  pauseSeconds: 0.25,
} as const;

export interface GovernorState {
  grace: number;
  windowTime: number;
  frames: number;
  lowRuns: number;
  stepDowns: number;
  fps: number;
}

export interface GovernorContext {
  auto: boolean;
  tier: Tier;
  dpr: number;
  introDone: boolean;
}

export type GovernorStep = { kind: "tier"; tier: Tier } | { kind: "dpr"; dpr: number };

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
