import { describe, expect, it } from "vitest";
import { ledColor, windowFactor, yardState } from "@/world/lib/status";

describe("windowFactor", () => {
  it("darkens only a confirmed-down service", () => {
    expect(windowFactor("unknown", "rl")).toBe(1);
    expect(windowFactor({ rl: { ok: true, ms: 10 } }, "rl")).toBe(1);
    expect(windowFactor({ rl: { ok: false, ms: null } }, "rl")).toBe(0);
    expect(windowFactor({ rl: { ok: false, ms: null } }, "es")).toBe(1);
  });
});

describe("yardState", () => {
  it("is unknown without data, else the share of probed apps that are down", () => {
    expect(yardState("unknown")).toEqual({ kind: "unknown" });
    expect(yardState({})).toEqual({ kind: "unknown" });
    expect(
      yardState({
        rl: { ok: false, ms: null },
        es: { ok: true, ms: 1 },
        f1: { ok: true, ms: 1 },
        wt: { ok: true, ms: 1 },
      }),
    ).toEqual({ kind: "known", downShare: 0.25 });
  });
});

describe("ledColor", () => {
  it("uses one palette for every rack when healthy", () => {
    const ok = { kind: "known" as const, downShare: 0 };
    expect(ledColor(ok, 0.1)).toBe("#4ade80");
    expect(["#4ade80", "#1a3a2a", "#60a5fa"]).toContain(ledColor(ok, 0.9));
  });

  it("shows red for the down share and grey when unknown", () => {
    expect(ledColor({ kind: "known", downShare: 0.5 }, 0.2)).toBe("#ef4444");
    expect(ledColor({ kind: "known", downShare: 0.5 }, 0.8)).not.toBe("#ef4444");
    expect(["#6b7280", "#374151"]).toContain(ledColor({ kind: "unknown" }, 0.3));
  });
});
