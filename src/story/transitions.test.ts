// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { enterExplore, enterStory, enterText, exploreBlocked } from "@/story/transitions";
import { useBaseCamp } from "@/store/store";

beforeEach(() => {
  document.documentElement.className = "has-webgl";
  useBaseCamp.setState({
    mode: "text",
    town: "loading",
    selected: null,
    stop: 2,
    qualityMode: "auto",
    autoTier: 2,
  });
});

describe("enterExplore", () => {
  it("works from Text while the town is still loading, selecting the current stop's place", () => {
    enterExplore();
    const s = useBaseCamp.getState();
    expect([s.mode, s.selected]).toEqual(["explore", "f1"]);
  });

  it("selects the given place", () => {
    enterExplore("arena");
    expect(useBaseCamp.getState().selected).toBe("arena");
  });

  it("does nothing without WebGL2, or for a town that failed", () => {
    document.documentElement.className = "";
    enterExplore();
    expect(useBaseCamp.getState().mode).toBe("text");
    document.documentElement.className = "has-webgl";
    useBaseCamp.setState({ town: "off" });
    enterExplore();
    expect(useBaseCamp.getState().mode).toBe("text");
  });

  it("turns a Lite town back on, at the device's own tier", () => {
    useBaseCamp.setState({ town: "off", qualityMode: "Lite" });
    enterExplore();
    const s = useBaseCamp.getState();
    expect([s.mode, s.town, s.qualityMode, s.tier]).toEqual(["explore", "loading", "auto", 2]);
  });

  it("turns a Lite town back on at Low when the device's own pick was Lite", () => {
    useBaseCamp.setState({ town: "off", qualityMode: "Lite", autoTier: 0 });
    enterExplore();
    expect(useBaseCamp.getState().qualityMode).toBe("Low");
    expect(useBaseCamp.getState().town).toBe("loading");
  });
});

describe("exploreBlocked", () => {
  it("names why Explore is off, or null when it is open", () => {
    expect(exploreBlocked(useBaseCamp.getState())).toBeNull();
    useBaseCamp.setState({ town: "off" });
    expect(exploreBlocked(useBaseCamp.getState())).toBe("Your browser can't draw the 3D town");
    useBaseCamp.setState({ qualityMode: "Lite" });
    expect(exploreBlocked(useBaseCamp.getState())).toBeNull();
    document.documentElement.className = "";
    expect(exploreBlocked(useBaseCamp.getState())).toBe("Your browser can't draw the 3D town");
  });
});

describe("enterStory and enterText", () => {
  it("set the mode", () => {
    enterStory();
    expect(useBaseCamp.getState().mode).toBe("story");
    enterText();
    expect(useBaseCamp.getState().mode).toBe("text");
  });
});
