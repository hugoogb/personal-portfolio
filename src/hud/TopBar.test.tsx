// @vitest-environment jsdom
import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { TopBar } from "@/hud/TopBar";
import { useBaseCamp } from "@/store/store";

beforeEach(() => useBaseCamp.setState(useBaseCamp.getInitialState()));

describe("TopBar", () => {
  it("names Hugo GB and shows no invented live count", () => {
    render(<TopBar />);
    expect(screen.getByText("Hugo GB")).toBeTruthy();
    expect(screen.getByTitle("Projects confirmed live").textContent).toContain("-");
  });

  it("counts discovered places", () => {
    render(<TopBar />);
    expect(screen.getByTitle("Places discovered").textContent).toContain("0/11");
    act(() => useBaseCamp.getState().select("rl"));
    expect(screen.getByTitle("Places discovered").textContent).toContain("1/11");
  });

  it("toggles the settings panel and opens the Brief", () => {
    render(<TopBar />);
    const settings = screen.getByRole("button", { name: "Settings" });
    fireEvent.click(settings);
    expect(useBaseCamp.getState().panel).toBe("settings");
    fireEvent.click(settings);
    expect(useBaseCamp.getState().panel).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Brief" }));
    expect(useBaseCamp.getState().briefOpen).toBe(true);
  });
});
