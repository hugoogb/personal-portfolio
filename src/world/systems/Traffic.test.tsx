// @vitest-environment jsdom
import { useLayoutEffect } from "react";
import { render } from "@testing-library/react";
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

afterEach(() => {
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
});
