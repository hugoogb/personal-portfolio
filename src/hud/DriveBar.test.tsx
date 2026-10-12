// @vitest-environment jsdom
import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { DriveBar } from "@/hud/DriveBar";
import { useBaseCamp } from "@/store/store";

beforeEach(() => useBaseCamp.setState(useBaseCamp.getInitialState()));

describe("DriveBar", () => {
  it("shows the real score", () => {
    render(<DriveBar />);
    expect(screen.getByText("0")).toBeTruthy();
    act(() => useBaseCamp.getState().addGoal("Blue"));
    expect(screen.getByText("1")).toBeTruthy();
  });
});
