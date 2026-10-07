// @vitest-environment jsdom
import { act, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { BuiltWorld } from "@/world/build";
import { Life } from "@/world/systems/Life";

const frames: ((s: unknown, dt: number) => void)[] = [];
vi.mock("@react-three/fiber", () => ({
  useFrame: (cb: (s: unknown, dt: number) => void) => {
    frames.length = 0;
    frames.push(cb);
  },
}));

const reduce = (on: boolean) =>
  vi.stubGlobal("matchMedia", (q: string) => ({
    matches: on && q.includes("prefers-reduced-motion"),
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
  }));

const fake = () => {
  const kit = {
    frame: vi.fn(),
    settle: vi.fn(),
    light: vi.fn(),
    paintAccent: vi.fn(),
    signTextures: [],
  };
  return { kit, world: { kit, env: {} } as unknown as BuiltWorld };
};
const tick = (dt: number) => act(() => frames[0]({}, dt));

afterEach(() => vi.unstubAllGlobals());

describe("Life", () => {
  it("runs the frame hooks once per frame with a clamped dt", () => {
    reduce(false);
    const { kit, world } = fake();
    render(<Life world={world} />);
    tick(0.5);
    expect(kit.frame).toHaveBeenCalledTimes(1);
    expect(kit.frame.mock.calls[0][0]).toBe(0.05);
    expect(kit.settle).not.toHaveBeenCalled();
  });

  it("under reduced motion it never advances the hooks: it poses the town once and keeps the lighting current", () => {
    reduce(true);
    const { kit, world } = fake();
    render(<Life world={world} />);
    tick(0.05);
    tick(0.05);
    tick(0.05);
    expect(kit.frame).not.toHaveBeenCalled();
    expect(kit.settle).toHaveBeenCalledTimes(1);
    expect(kit.light).toHaveBeenCalledTimes(3);
  });
});
