// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Pacer } from "@/world/systems/Pacer";

const state = { clock: { elapsedTime: 0 }, advance: vi.fn() };
vi.mock("@react-three/fiber", () => ({
  useThree: (sel: (s: unknown) => unknown) => sel({ get: () => state }),
}));

let queue: FrameRequestCallback[] = [];

/** Fires the display's frames for `ms` at `hz`, and counts the ones the pacer drew. */
const display = (hz: number, ms: number, from = 0) => {
  const before = state.advance.mock.calls.length;
  const frames = Math.max(1, Math.round((ms * hz) / 1000));
  for (let i = 0; i < frames; i++) {
    const due = queue;
    queue = [];
    for (const cb of due) cb(from + (i * 1000) / hz);
  }
  return state.advance.mock.calls.length - before;
};

beforeEach(() => {
  queue = [];
  state.advance.mockReset();
  state.clock.elapsedTime = 0;
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => queue.push(cb));
  vi.stubGlobal("cancelAnimationFrame", () => {
    queue = [];
  });
});
afterEach(() => vi.unstubAllGlobals());

describe("Pacer (spec 8)", () => {
  it("draws every frame of a 60 Hz display", () => {
    render(<Pacer fps={60} />);
    expect(display(60, 1000)).toBe(60);
  });

  it("draws every other frame of a 120 Hz display", () => {
    render(<Pacer fps={60} />);
    expect(display(120, 1000)).toBe(60);
  });

  it("averages 60 on a 144 Hz display", () => {
    render(<Pacer fps={60} />);
    const n = display(144, 1000);
    expect(n).toBeGreaterThanOrEqual(58);
    expect(n).toBeLessThanOrEqual(61);
  });

  it("draws Low at 30", () => {
    render(<Pacer fps={30} />);
    expect(display(60, 1000)).toBe(30);
  });

  it("starts its clock one frame back, so the first delta is a frame, not the page's age", () => {
    render(<Pacer fps={60} />);
    display(60, 1, 5000);
    const [seconds] = state.advance.mock.calls[0];
    expect(seconds).toBe(5);
    expect(seconds - state.clock.elapsedTime).toBeCloseTo(1 / 60, 6);
  });

  it("stops drawing when unmounted", () => {
    const view = render(<Pacer fps={60} />);
    view.unmount();
    expect(display(60, 500)).toBe(0);
  });
});
