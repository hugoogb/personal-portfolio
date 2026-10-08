// @vitest-environment jsdom
import { act, render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const trackPlace = vi.fn();
const trackAchievement = vi.fn();
vi.mock("@/utils/track", () => ({
  trackPlace: (...a: unknown[]) => trackPlace(...a),
  trackAchievement: (...a: unknown[]) => trackAchievement(...a),
  trackOutbound: vi.fn(),
}));
vi.mock("@/boot/Boot", () => ({ Boot: () => null }));
vi.mock("@vercel/analytics/react", () => ({ Analytics: () => null }));
vi.mock("@vercel/speed-insights/react", () => ({ SpeedInsights: () => null }));

const { ClientRoot } = await import("@/client/ClientRoot");
const { useBaseCamp } = await import("@/store/store");

beforeEach(() => {
  trackPlace.mockReset();
  trackAchievement.mockReset();
  useBaseCamp.setState(useBaseCamp.getInitialState());
});

describe("ClientRoot analytics", () => {
  it("reports a place once per selection, never a deselect", () => {
    render(<ClientRoot />);
    act(() => useBaseCamp.getState().select("rl"));
    expect(trackPlace).toHaveBeenCalledTimes(1);
    expect(trackPlace).toHaveBeenCalledWith("rl");
    act(() => useBaseCamp.getState().select("rl"));
    act(() => useBaseCamp.getState().deselect());
    expect(trackPlace).toHaveBeenCalledTimes(1);
  });

  it("reports each new achievement once", () => {
    render(<ClientRoot />);
    act(() => useBaseCamp.getState().achieve("hat"));
    expect(trackAchievement).toHaveBeenCalledTimes(1);
    expect(trackAchievement).toHaveBeenCalledWith("hat");
    act(() => useBaseCamp.getState().achieve("hat"));
    expect(trackAchievement).toHaveBeenCalledTimes(1);
  });

  it("does not report what was already saved when it mounts", () => {
    useBaseCamp.setState({ achievements: ["hat"], selected: "rl" });
    render(<ClientRoot />);
    expect(trackAchievement).not.toHaveBeenCalled();
    expect(trackPlace).not.toHaveBeenCalled();
  });

  it("does not count the default HQ selection of a plain load", () => {
    render(<ClientRoot />);
    act(() => useBaseCamp.getState().select("hq"));
    expect(trackPlace).not.toHaveBeenCalled();
    act(() => useBaseCamp.getState().select("rl"));
    act(() => useBaseCamp.getState().select("hq"));
    expect(trackPlace.mock.calls).toEqual([["rl"], ["hq"]]);
  });
});
