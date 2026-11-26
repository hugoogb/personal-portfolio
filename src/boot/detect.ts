import type { TierType } from "detect-gpu";
import {
  chooseTier,
  resolveTier,
  type QualityMode,
  type Tier,
  type TierSignals,
} from "@/boot/tiers";

type BaseSignals = Omit<TierSignals, "webgl" | "gpuTier">;
type GpuResult = { tier: number; type: TierType };

export const signalsFrom = (gpu: GpuResult | null, base: BaseSignals): TierSignals => ({
  ...base,
  webgl: gpu ? gpu.type !== "WEBGL_UNSUPPORTED" : true,
  gpuTier:
    gpu?.type === "BLOCKLISTED"
      ? 0
      : gpu?.type === "BENCHMARK"
        ? (Math.max(0, Math.min(3, gpu.tier)) as Tier)
        : null,
});

export const bootTier = (signals: TierSignals, mode: QualityMode) => {
  const auto = chooseTier(signals);
  return { auto, tier: signals.webgl ? resolveTier(mode, auto) : (0 as Tier) };
};

export const hasWebgl2 = (win: Window = window): boolean => {
  try {
    const gl = win.document.createElement("canvas").getContext("webgl2");
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    return Boolean(gl);
  } catch {
    return false;
  }
};

export const readSignals = async (win: Window = window): Promise<TierSignals> => {
  const media = (query: string) =>
    typeof win.matchMedia === "function" && win.matchMedia(query).matches;
  const nav = win.navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };
  const base: BaseSignals = {
    reducedMotion: media("(prefers-reduced-motion: reduce)"),
    saveData: Boolean(nav.connection?.saveData),
    cores: nav.hardwareConcurrency || 4,
    memoryGb: nav.deviceMemory ?? null,
    coarsePointer: media("(pointer: coarse)"),
  };
  let gpu: GpuResult | null = null;
  try {
    const { getGPUTier } = await import("detect-gpu");
    gpu = await getGPUTier({ benchmarksURL: "/benchmarks" });
  } catch {
    gpu = null;
  }
  return signalsFrom(gpu, base);
};
