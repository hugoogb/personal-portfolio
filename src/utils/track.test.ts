import { beforeEach, describe, expect, it, vi } from "vitest";

const track = vi.fn();
let blocked = false;
vi.mock("@vercel/analytics", () => ({
  track: (...a: unknown[]) => {
    track(...a);
    if (blocked) throw new Error("blocked");
  },
}));

const { bootReason, trackAchievement, trackBrief, trackOutbound, trackPlace, trackTier } =
  await import("@/utils/track");

const signals = {
  webgl: true,
  reducedMotion: false,
  saveData: false,
  gpuTier: 3 as const,
  cores: 8,
  memoryGb: 8,
  coarsePointer: false,
};

beforeEach(() => {
  track.mockReset();
  blocked = false;
});

describe("analytics events (spec 9.8)", () => {
  it("sends exactly the four new events with their fields", () => {
    trackPlace("rl");
    trackAchievement("hat");
    trackBrief("key");
    trackTier(3, 2, "governor");
    expect(track.mock.calls).toEqual([
      ["place_select", { id: "rl" }],
      ["achievement", { id: "hat" }],
      ["brief_open", { source: "key" }],
      ["tier", { initial: "High", final: "Medium", reason: "governor" }],
    ]);
  });

  it("keeps outbound tracking", () => {
    trackOutbound("https://readledger.app", "ReadLedger");
    expect(track).toHaveBeenCalledWith("outbound", {
      url: "https://readledger.app",
      label: "ReadLedger",
    });
  });

  it("never throws when analytics fails", () => {
    blocked = true;
    expect(() => trackPlace("rl")).not.toThrow();
    expect(() => trackOutbound("https://x.dev", "x")).not.toThrow();
  });

  it("explains the boot tier", () => {
    expect(bootReason(signals, "auto")).toBe("auto");
    expect(bootReason(signals, "Low")).toBe("saved");
    expect(bootReason({ ...signals, webgl: false }, "auto")).toBe("no-webgl");
    expect(bootReason({ ...signals, reducedMotion: true }, "auto")).toBe("reduced-motion");
    expect(bootReason({ ...signals, saveData: true }, "auto")).toBe("save-data");
    expect(bootReason({ ...signals, gpuTier: 0 }, "auto")).toBe("gpu");
  });
});
