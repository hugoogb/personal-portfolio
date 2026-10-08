import { describe, expect, it } from "vitest";
import { SERVICES, STATUS_TARGETS, appsOn } from "@/content/services";

describe("services", () => {
  it("declares hosting for the five projects and this site", () => {
    expect(SERVICES.map((s) => s.id).sort()).toEqual(["av", "es", "f1", "hq", "rl", "wt"]);
  });

  it("splits hosting as verified on 2026-10-06", () => {
    expect(appsOn("vps").sort()).toEqual(["es", "f1", "rl"]);
    expect(appsOn("vercel").sort()).toEqual(["av", "f1", "hq", "wt"]);
  });

  it("probes every project over https, but not this site", () => {
    expect(STATUS_TARGETS.map((t) => t.id).sort()).toEqual(["av", "es", "f1", "rl", "wt"]);
    for (const target of STATUS_TARGETS) expect(target.url).toBe(`https://${target.host}`);
  });
});
