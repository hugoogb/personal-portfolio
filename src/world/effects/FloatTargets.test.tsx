// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FloatTargets } from "@/world/effects/FloatTargets";

let names: string[] = [];
vi.mock("@react-three/fiber", () => ({
  useThree: (sel: (t: unknown) => unknown) =>
    sel({ gl: { extensions: { has: (n: string) => names.includes(n) } } }),
}));

describe("FloatTargets", () => {
  it("renders the effects only on a context with float render targets", () => {
    names = [];
    const off = render(<FloatTargets>fx</FloatTargets>);
    expect(off.container.textContent).toBe("");
    off.unmount();
    names = ["EXT_color_buffer_float"];
    expect(render(<FloatTargets>fx</FloatTargets>).container.textContent).toBe("fx");
  });
});
