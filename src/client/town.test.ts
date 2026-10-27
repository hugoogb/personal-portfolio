// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { slowNetwork, startTown } from "@/client/town";
import { baseCamp } from "@/store/core";

const mountTown = vi.hoisted(() => vi.fn());
vi.mock("@/boot/TownApp", () => ({ mountTown }));

const nav = (effectiveType?: string) =>
  ({ connection: effectiveType ? { effectiveType } : undefined }) as unknown as Navigator;

const flush = () => new Promise((r) => setTimeout(r, 0));

beforeEach(() => {
  mountTown.mockClear();
  baseCamp.setState({ ...baseCamp.getInitialState(), mode: "text", town: "loading" });
});

describe("slowNetwork", () => {
  it("is true on 2G and 3G only, and false where the browser does not say", () => {
    expect(["slow-2g", "2g", "3g"].map((t) => slowNetwork(nav(t)))).toEqual([true, true, true]);
    expect(slowNetwork(nav("4g"))).toBe(false);
    expect(slowNetwork(nav())).toBe(false);
  });
});

describe("startTown", () => {
  it("never loads the town in Text, and loads it at once for Explore", async () => {
    const root = document.createElement("div");
    startTown(root, null);
    await flush();
    expect(mountTown).not.toHaveBeenCalled();
    baseCamp.getState().setMode("explore");
    await vi.waitFor(() => expect(mountTown).toHaveBeenCalledTimes(1));
    // Later changes are Town's own business: the root is mounted once.
    baseCamp.getState().setMode("story");
    baseCamp.getState().setMode("explore");
    await flush();
    expect(mountTown).toHaveBeenCalledTimes(1);
  });

  it("does not load the town for Story on a slow link, but does when Explore is picked", async () => {
    vi.stubGlobal("navigator", nav("3g"));
    try {
      baseCamp.setState({ mode: "story" });
      startTown(document.createElement("div"), null);
      await new Promise((r) => setTimeout(r, 300));
      expect(mountTown).not.toHaveBeenCalled();
      baseCamp.getState().setMode("explore");
      await vi.waitFor(() => expect(mountTown).toHaveBeenCalledTimes(1));
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
