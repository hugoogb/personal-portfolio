// @vitest-environment jsdom
import { useLayoutEffect } from "react";
import { act, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useBaseCamp } from "@/store/store";
import type { BuiltWorld } from "@/world/build";
import { CAPS } from "@/world/traffic/model";
import { TrafficSim } from "@/world/traffic/sim";
import { Traffic } from "@/world/systems/Traffic";

vi.mock("@react-three/fiber", () => ({ useFrame: () => undefined }));

/** Its layout effect runs after Traffic renders and before Traffic's passive effects. */
const InTheGap = () => {
  useLayoutEffect(() => useBaseCamp.getState().setTier(1), []);
  return null;
};

const media = (reduced: boolean) => {
  let fire: () => void = () => undefined;
  const mq = {
    get matches() {
      return reduced;
    },
    addEventListener: (_: string, f: () => void) => (fire = f),
    removeEventListener: vi.fn(),
  };
  vi.stubGlobal("matchMedia", () => mq);
  return {
    flip: (v: boolean) => {
      reduced = v;
      fire();
    },
    mq,
  };
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  useBaseCamp.setState({ tier: 3 });
});

describe("Traffic", () => {
  it("catches up with a tier change made between the sim's build and its subscription", () => {
    useBaseCamp.setState({ tier: 3 });
    const caps = vi.spyOn(TrafficSim.prototype, "setCaps");
    render(
      <>
        <Traffic world={{} as BuiltWorld} />
        <InTheGap />
      </>,
    );
    expect(caps).toHaveBeenLastCalledWith(CAPS[1]);
  });

  it("sends no packets under reduced motion, and re-applies the caps when the preference flips", () => {
    useBaseCamp.setState({ tier: 3 });
    const m = media(true);
    const caps = vi.spyOn(TrafficSim.prototype, "setCaps");
    const { unmount } = render(<Traffic world={{} as BuiltWorld} />);
    expect(caps).toHaveBeenLastCalledWith({ req: 0, res: 0 });
    act(() => m.flip(false));
    expect(caps).toHaveBeenLastCalledWith(CAPS[3]);
    act(() => m.flip(true));
    expect(caps).toHaveBeenLastCalledWith({ req: 0, res: 0 });
    unmount();
    expect(m.mq.removeEventListener).toHaveBeenCalled();
  });
});
