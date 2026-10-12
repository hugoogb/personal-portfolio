// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { PLACE_BY_ID } from "@/content/places";
import { gpuRenderer, runCommand, runPrimary } from "@/hud/actions";
import { enterStory, enterText } from "@/story/transitions";

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
