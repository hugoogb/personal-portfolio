import { describe, expect, it } from "vitest";
import { bootTier, signalsFrom } from "@/boot/detect";

const base = {
  reducedMotion: false,
  saveData: false,
  cores: 8,
  memoryGb: 16,
  coarsePointer: false,
};

describe("signalsFrom", () => {
  it("passes a benchmarked tier through", () => {
    expect(signalsFrom({ tier: 2, type: "BENCHMARK" }, base)).toMatchObject({
      webgl: true,
      gpuTier: 2,
    });
  });

  it("treats a blocklisted GPU as tier 0 and an unknown one as no information", () => {
    expect(signalsFrom({ tier: 0, type: "BLOCKLISTED" }, base).gpuTier).toBe(0);
    expect(signalsFrom({ tier: 1, type: "FALLBACK" }, base).gpuTier).toBeNull();
    expect(signalsFrom(null, base)).toMatchObject({ webgl: true, gpuTier: null });
  });

  it("reports missing WebGL", () => {
    expect(signalsFrom({ tier: 0, type: "WEBGL_UNSUPPORTED" }, base).webgl).toBe(false);
  });
});

describe("bootTier", () => {
  const signals = signalsFrom({ tier: 3, type: "BENCHMARK" }, base);

  it("uses the heuristics in auto mode", () => {
    expect(bootTier(signals, "auto")).toEqual({ auto: 3, tier: 3 });
  });

  it("lets a manual choice outrank them, even reduced motion", () => {
    expect(bootTier({ ...signals, reducedMotion: true }, "Low")).toEqual({ auto: 0, tier: 1 });
  });

  it("never starts the town without WebGL", () => {
    expect(bootTier({ ...signals, webgl: false }, "High").tier).toBe(0);
  });
});
