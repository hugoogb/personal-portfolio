// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";

const trackBrief = vi.fn();
vi.mock("@/utils/track", () => ({ trackBrief, trackOutbound: vi.fn() }));

const { gpuRenderer, openBrief, toggleBrief } = await import("@/hud/actions");
const { useBaseCamp } = await import("@/store/store");

beforeEach(() => {
  trackBrief.mockReset();
  useBaseCamp.setState(useBaseCamp.getInitialState());
});

describe("Brief analytics", () => {
  it("reports the source when the Brief opens", () => {
    toggleBrief("key");
    expect(trackBrief).toHaveBeenCalledWith("key");
  });

  it("does not report a close", () => {
    useBaseCamp.setState({ briefOpen: true });
    toggleBrief("button");
    expect(trackBrief).not.toHaveBeenCalled();
  });

  it("passes the source through openBrief", () => {
    openBrief("work", "deeplink");
    expect(trackBrief).toHaveBeenCalledWith("deeplink");
  });

  it("does not report again when the Brief is already open, but still scrolls", () => {
    useBaseCamp.setState({ briefOpen: true });
    document.body.innerHTML = '<div id="brief"><h2 id="work"></h2></div>';
    document.documentElement.classList.add("brief-open");
    const scroll = vi.fn();
    document.getElementById("work")!.scrollIntoView = scroll;
    vi.stubGlobal("requestAnimationFrame", (cb: () => void) => cb());
    openBrief("work", "deeplink");
    vi.unstubAllGlobals();
    document.documentElement.classList.remove("brief-open");
    expect(trackBrief).not.toHaveBeenCalled();
    expect(scroll).toHaveBeenCalled();
  });
});

describe("gpuRenderer", () => {
  const withGl = (gl: unknown) => {
    document.body.innerHTML = '<div class="stage"><canvas></canvas></div>';
    document.querySelector("canvas")!.getContext = (() => gl) as never;
  };

  it("reads the plain RENDERER parameter first, without the debug extension", () => {
    const getExtension = vi.fn();
    withGl({
      RENDERER: 7937,
      getParameter: (p: number) => (p === 7937 ? "ANGLE (Apple M2)" : null),
      getExtension,
    });
    expect(gpuRenderer()).toBe("ANGLE (Apple M2)");
    expect(getExtension).not.toHaveBeenCalled();
  });

  it("falls back to the debug extension, then to unknown", () => {
    withGl({
      RENDERER: 7937,
      getParameter: (p: number) => (p === 37446 ? "Unmasked GPU" : "WebKit WebGL"),
      getExtension: () => ({ UNMASKED_RENDERER_WEBGL: 37446 }),
    });
    expect(gpuRenderer()).toBe("Unmasked GPU");
    withGl({ RENDERER: 7937, getParameter: () => null, getExtension: () => null });
    expect(gpuRenderer()).toBe("unknown GPU");
  });
});
