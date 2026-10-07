// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";

const trackBrief = vi.fn();
vi.mock("@/utils/track", () => ({ trackBrief, trackOutbound: vi.fn() }));

const { openBrief, toggleBrief } = await import("@/hud/actions");
const { useBaseCamp } = await import("@/store/store");

beforeEach(() => {
  trackBrief.mockReset();
  useBaseCamp.setState(useBaseCamp.getInitialState());
});

describe("Brief analytics", () => {
  it("reports the source when the Brief opens", () => {
    toggleBrief("key");
    expect(trackBrief).toHaveBeenCalledWith("key");
  });

  it("does not report a close", () => {
    useBaseCamp.setState({ briefOpen: true });
    toggleBrief("button");
    expect(trackBrief).not.toHaveBeenCalled();
  });

  it("passes the source through openBrief", () => {
    openBrief("work", "deeplink");
    expect(trackBrief).toHaveBeenCalledWith("deeplink");
  });
});
