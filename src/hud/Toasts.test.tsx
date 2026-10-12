// @vitest-environment jsdom
import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TOAST_MS, Toasts } from "@/hud/Toasts";
import { useBaseCamp } from "@/store/store";

beforeEach(() => {
  useBaseCamp.setState(useBaseCamp.getInitialState());
  vi.useFakeTimers();
});
afterEach(() => vi.useRealTimers());

describe("Toasts", () => {
  it("shows a toast, then lets it go", () => {
    render(<Toasts />);
    act(() => useBaseCamp.getState().toast("Email copied"));
    expect(screen.getByText("Email copied")).toBeTruthy();
    act(() => vi.advanceTimersByTime(TOAST_MS + 10));
    expect(screen.queryByText("Email copied")).toBeNull();
  });
});
