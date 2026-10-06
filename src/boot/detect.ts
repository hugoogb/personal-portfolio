import { getGPUTier, type TierType } from "detect-gpu";
import {
  chooseTier,
  resolveTier,
  type QualityMode,
  type Tier,
  type TierSignals,
} from "@/boot/tiers";

type BaseSignals = Omit<TierSignals, "webgl" | "gpuTier">;
type GpuResult = { tier: number; type: TierType };

/**
 * detect-gpu's verdict as tier signals. A blocklisted GPU is tier 0; a GPU it
 * does not know (FALLBACK) tells us nothing, so the heuristics decide.
 */
export const signalsFrom = (
  gpu: GpuResult | null,
  base: BaseSignals,
  webgl2 = true,
): TierSignals => ({
  ...base,
  webgl: webgl2 && (gpu ? gpu.type !== "WEBGL_UNSUPPORTED" : true),
  gpuTier:
    gpu?.type === "BLOCKLISTED"
      ? 0
      : gpu?.type === "BENCHMARK"
        ? (Math.max(0, Math.min(3, gpu.tier)) as Tier)
        : null,
});

/** The tier to start on. No WebGL always means Lite; otherwise a manual choice wins. */
export const bootTier = (signals: TierSignals, mode: QualityMode) => {
  const auto = chooseTier(signals);
  return { auto, tier: signals.webgl ? resolveTier(mode, auto) : (0 as Tier) };
};

/** The town needs WebGL2 (three r163+ has no WebGL1 path). The probe's context is given back. */
const hasWebgl2 = (win: Window): boolean => {
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
    // Benchmark tables are served from this site (vite.config.ts), not unpkg.
    gpu = await getGPUTier({ benchmarksURL: "/benchmarks" });
  } catch {
    gpu = null;
  }
  return signalsFrom(gpu, base, hasWebgl2(win));
};
