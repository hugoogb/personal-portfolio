// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { IDLE_AFTER_MS, useIdle } from "@/hooks/useIdle";
import { useBaseCamp } from "@/store/store";

beforeEach(() => {
  vi.useFakeTimers();
  vi.spyOn(document, "hasFocus").mockReturnValue(true);
  useBaseCamp.setState({ idle: false });
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("useIdle", () => {
  it("goes idle after a quiet spell and wakes on input", () => {
    renderHook(() => useIdle());
    act(() => vi.advanceTimersByTime(IDLE_AFTER_MS - 1));
    expect(useBaseCamp.getState().idle).toBe(false);
    act(() => vi.advanceTimersByTime(1));
    expect(useBaseCamp.getState().idle).toBe(true);
    act(() => void window.dispatchEvent(new Event("pointermove")));
    expect(useBaseCamp.getState().idle).toBe(false);
  });

  it("restarts the countdown on every input", () => {
    renderHook(() => useIdle());
    act(() => vi.advanceTimersByTime(IDLE_AFTER_MS - 100));
    act(() => void window.dispatchEvent(new Event("keydown")));
    act(() => vi.advanceTimersByTime(IDLE_AFTER_MS - 100));
    expect(useBaseCamp.getState().idle).toBe(false);
  });

  it("is idle while the window is in the background, and clears on unmount", () => {
    const { unmount } = renderHook(() => useIdle());
    act(() => void window.dispatchEvent(new Event("blur")));
    expect(useBaseCamp.getState().idle).toBe(true);
    act(() => void window.dispatchEvent(new Event("focus")));
    expect(useBaseCamp.getState().idle).toBe(false);
    act(() => void window.dispatchEvent(new Event("blur")));
    unmount();
    expect(useBaseCamp.getState().idle).toBe(false);
  });
});
