// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PLACE_BY_ID } from "@/content/places";
import { gpuRenderer, runCommand, runPrimary } from "@/hud/actions";
import { enterStory, enterText } from "@/story/transitions";
import { useBaseCamp } from "@/store/store";
import { VIEW_MAX } from "@/world/lib/camera";
import { OVERVIEW } from "@/world/lib/map";

vi.mock("@/story/transitions", () => ({
  enterStory: vi.fn(),
  enterText: vi.fn(),
  enterExplore: vi.fn(),
}));

describe("runPrimary", () => {
  it("takes HQ's About me back to the story", () => {
    expect(PLACE_BY_ID.hq.primary).toEqual({ label: "About me", action: "story" });
    runPrimary(PLACE_BY_ID.hq);
    expect(enterStory).toHaveBeenCalled();
  });
});

describe("touch-only devices", () => {
  beforeEach(() => {
    useBaseCamp.setState(useBaseCamp.getInitialState());
    vi.stubGlobal("matchMedia", () => ({ matches: false }));
  });
  afterEach(() => vi.unstubAllGlobals());

  it("do not start the drive from Q or the console, and say why", () => {
    runPrimary(PLACE_BY_ID.arena);
    runCommand({ id: "drive", label: "drive", run: { type: "drive" } });
    const s = useBaseCamp.getState();
    expect(s.driving).toBe(false);
    expect(s.toasts.map((t) => t.text)).toEqual([
      expect.stringContaining("keyboard"),
      expect.stringContaining("keyboard"),
    ]);
  });

  it("pull the overview back on a narrow screen", () => {
    vi.stubGlobal("innerWidth", 390);
    runPrimary(PLACE_BY_ID.yard);
    expect(useBaseCamp.getState().goal).toMatchObject({ x: OVERVIEW.x, view: VIEW_MAX });
  });
});

describe("runPrimary with a pointer", () => {
  beforeEach(() => useBaseCamp.setState(useBaseCamp.getInitialState()));

  it("starts the drive at the arena", () => {
    runPrimary(PLACE_BY_ID.arena);
    expect(useBaseCamp.getState()).toMatchObject({ driving: true, selected: "arena" });
  });
});

describe("runCommand", () => {
  it("switches to Story or Text from the console", () => {
    runCommand({ id: "story", label: "story", run: { type: "mode", mode: "story" } });
    expect(enterStory).toHaveBeenCalled();
    runCommand({ id: "text", label: "text", run: { type: "mode", mode: "text" } });
    expect(enterText).toHaveBeenCalled();
  });
});

describe("gpuRenderer", () => {
  const withGl = (gl: unknown) => {
    document.body.innerHTML = '<div id="town-root"><canvas></canvas></div>';
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
