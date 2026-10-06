// @vitest-environment jsdom
import { fireEvent, render } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { Minimap } from "@/hud/Minimap";
import { toMap } from "@/hud/minimap";
import { useBaseCamp } from "@/store/store";

beforeEach(() => useBaseCamp.setState(useBaseCamp.getInitialState()));

describe("Minimap", () => {
  it("dims undiscovered places and moves the camera on click", () => {
    useBaseCamp.setState({ discovered: ["rl"], view: { x: 0, z: 0, view: 14, aspect: 1.5 } });
    const { container } = render(<Minimap />);
    expect(container.querySelectorAll(".minimap__place.is-found")).toHaveLength(1);
    const svg = container.querySelector("svg")!;
    svg.getBoundingClientRect = () =>
      ({
        left: 0,
        top: 0,
        width: 460,
        height: 460,
        right: 460,
        bottom: 460,
        x: 0,
        y: 0,
        toJSON() {},
      }) as DOMRect;
    const target = toMap(5, -3);
    fireEvent.click(svg, {
      clientX: (target.x / 46 + 0.5) * 460,
      clientY: (target.y / 46 + 0.5) * 460,
    });
    const goal = useBaseCamp.getState().goal!;
    expect(goal.x).toBeCloseTo(5, 4);
    expect(goal.z).toBeCloseTo(-3, 4);
    expect(goal.view).toBe(14);
  });
});
