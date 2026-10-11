// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { STOPS, stopIndexForPlace } from "@/content/tour";
import { enterExplore, enterStory, enterText, exploreBlocked } from "@/story/transitions";
import { useBaseCamp } from "@/store/store";

beforeEach(() => {
  document.documentElement.className = "";
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
    document.documentElement.className = "no-webgl";
    enterExplore();
    expect(useBaseCamp.getState().mode).toBe("text");
    document.documentElement.className = "";
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
    document.documentElement.className = "no-webgl";
    expect(exploreBlocked(useBaseCamp.getState())).toBe("Your browser can't draw the 3D town");
  });
});

describe("enterExplore from the finale", () => {
  it("selects nothing, so the camera stays at the overview", () => {
    useBaseCamp.setState({
      mode: "story",
      stop: STOPS.length - 1,
      town: "ready",
      selected: "post",
    });
    enterExplore();
    expect(useBaseCamp.getState().selected).toBeNull();
    expect(useBaseCamp.getState().mode).toBe("explore");
  });
});

describe("enterStory and enterText", () => {
  const original = Element.prototype.scrollIntoView;
  const nextFrame = () => new Promise((r) => requestAnimationFrame(() => r(null)));
  const sections = () => {
    document.body.innerHTML = STOPS.map((s) => `<section id="${s.anchor}"></section>`).join("");
  };
  afterEach(() => {
    Element.prototype.scrollIntoView = original;
    document.body.innerHTML = "";
  });

  it("set the mode", async () => {
    enterStory();
    expect(useBaseCamp.getState().mode).toBe("story");
    enterText();
    expect(useBaseCamp.getState().mode).toBe("text");
    await nextFrame(); // let the scrolls they queue land before the next test stubs scrollIntoView
  });

  it("return to the selected place's section", async () => {
    sections();
    const spy = vi.fn();
    Element.prototype.scrollIntoView = spy;
    useBaseCamp.setState({ mode: "explore", selected: "es", town: "ready" });
    enterStory();
    await nextFrame();
    expect(useBaseCamp.getState().mode).toBe("story");
    expect(spy.mock.contexts[0]).toBe(document.getElementById("esto-no-es-un-restaurante"));
  });

  it("return to the nearest stop for an explore-only place", async () => {
    sections();
    const spy = vi.fn();
    Element.prototype.scrollIntoView = spy;
    useBaseCamp.setState({ mode: "explore", selected: "stadium", town: "ready" });
    enterStory();
    await nextFrame();
    expect(useBaseCamp.getState().mode).toBe("story");
    const stop = STOPS[stopIndexForPlace("stadium")];
    expect(spy.mock.contexts[0]).toBe(document.getElementById(stop.anchor));
  });

  it("enterStory with nothing selected returns to the current stop (the finale)", async () => {
    sections();
    const spy = vi.fn();
    Element.prototype.scrollIntoView = spy;
    useBaseCamp.setState({ mode: "explore", stop: STOPS.length - 1, selected: null });
    enterStory();
    await nextFrame();
    expect(spy.mock.contexts[0]).toBe(document.getElementById("explore"));
  });

  it("enterText scrolls to the current stop", async () => {
    sections();
    const spy = vi.fn();
    Element.prototype.scrollIntoView = spy;
    useBaseCamp.setState({ mode: "story", stop: 3 });
    enterText();
    await nextFrame();
    expect(useBaseCamp.getState().mode).toBe("text");
    expect(spy.mock.contexts[0]).toBe(document.getElementById(STOPS[3].anchor));
  });
});
