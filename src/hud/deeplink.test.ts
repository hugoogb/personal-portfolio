import { describe, expect, it } from "vitest";
import { hashTarget } from "@/hud/deeplink";

describe("hashTarget", () => {
  it("selects a place by its slug, in any case", () => {
    expect(hashTarget("#readledger")).toEqual({ type: "place", id: "rl" });
    expect(hashTarget("#Contact")).toEqual({ type: "place", id: "post" });
    expect(hashTarget("#about")).toEqual({ type: "place", id: "hq" });
  });

  it("opens the Brief for #brief, and at the section for #work and #stack", () => {
    expect(hashTarget("#brief")).toEqual({ type: "brief", anchor: null });
    expect(hashTarget("#work")).toEqual({ type: "brief", anchor: "work" });
    expect(hashTarget("#Stack")).toEqual({ type: "brief", anchor: "stack" });
  });

  it("ignores an empty or unknown hash", () => {
    expect(hashTarget("")).toBeNull();
    expect(hashTarget("#")).toBeNull();
    expect(hashTarget("#nowhere")).toBeNull();
  });
});
