import { describe, expect, it } from "vitest";
import { PLACE_BY_ID } from "@/content/places";
import { liveCount, pillFor } from "@/hud/pill";

describe("pillFor", () => {
  it("is honest when status has not arrived", () => {
    expect(pillFor(PLACE_BY_ID.rl, "unknown")).toEqual({
      text: "Status unavailable",
      tone: "unknown",
    });
  });

  it("shows the round trip when a service is up, and Down when it is not", () => {
    expect(pillFor(PLACE_BY_ID.rl, { rl: { ok: true, ms: 120 } })).toEqual({
      text: "Live · 120 ms",
      tone: "ok",
    });
    expect(pillFor(PLACE_BY_ID.rl, { rl: { ok: false, ms: null } })).toEqual({
      text: "Down",
      tone: "down",
    });
  });

  it("keeps pre-launch amber even when the waitlist is up", () => {
    expect(pillFor(PLACE_BY_ID.wt, { wt: { ok: true, ms: 80 } })).toEqual({
      text: "Pre-launch",
      tone: "pre",
    });
  });

  it("uses the place's own pill where there is no service", () => {
    expect(pillFor(PLACE_BY_ID.hq, "unknown")).toEqual({ text: "You are here", tone: "neutral" });
    expect(pillFor(PLACE_BY_ID.stadium, "unknown").tone).toBe("neutral");
  });
});

describe("liveCount", () => {
  it("is null before any status, then counts only confirmed services", () => {
    expect(liveCount("unknown")).toBeNull();
    expect(liveCount({ rl: { ok: true, ms: 1 }, f1: { ok: false, ms: null } })).toEqual({
      ok: 1,
      total: 5,
    });
  });
});
