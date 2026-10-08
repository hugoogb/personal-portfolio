// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EffectsBoundary } from "@/world/effects/EffectsBoundary";

function Boom(): never {
  throw new Error("no float render targets");
}

describe("EffectsBoundary", () => {
  it("renders nothing when the effects fail, and keeps the rest alive", () => {
    const quiet = vi.spyOn(console, "error").mockImplementation(() => {});
    const { container } = render(
      <div>
        <span>town</span>
        <EffectsBoundary>
          <Boom />
        </EffectsBoundary>
      </div>,
    );
    expect(container.textContent).toBe("town");
    quiet.mockRestore();
  });

  it("warns once, not on every render", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const quiet = vi.spyOn(console, "error").mockImplementation(() => {});
    const { rerender } = render(
      <EffectsBoundary>
        <Boom />
      </EffectsBoundary>,
    );
    rerender(
      <EffectsBoundary>
        <Boom />
      </EffectsBoundary>,
    );
    expect(warn).toHaveBeenCalledTimes(1);
    quiet.mockRestore();
  });
});
