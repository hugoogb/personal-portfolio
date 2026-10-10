// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { gpuRenderer } from "@/hud/actions";

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
