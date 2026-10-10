// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { ModeSwitch } from "@/story/ModeSwitch";
import { useBaseCamp } from "@/store/store";

beforeEach(() => useBaseCamp.setState({ mode: "story", town: "loading", selected: null, stop: 0 }));

describe("ModeSwitch", () => {
  it("shows the three modes with the current one checked", () => {
    render(<ModeSwitch />);
    expect(screen.getByRole("radiogroup", { name: "View" })).toBeTruthy();
    expect(screen.getByRole("radio", { name: "Story" }).getAttribute("aria-checked")).toBe("true");
  });

  it("keeps Explore disabled until the town is ready, and says why", () => {
    render(<ModeSwitch />);
    const explore = screen.getByRole("radio", { name: /Explore/ });
    expect(explore.getAttribute("aria-disabled")).toBe("true");
    fireEvent.click(explore);
    expect(useBaseCamp.getState().mode).toBe("story");
  });

  it("explains a town that is off", () => {
    useBaseCamp.setState({ town: "off" });
    render(<ModeSwitch />);
    expect(screen.getByRole("radio", { name: /Explore/ }).getAttribute("title")).toMatch(
      /can't draw the 3D town/,
    );
  });

  it("switches modes and selects the current stop's place on entering Explore", () => {
    useBaseCamp.setState({ town: "ready", stop: 3 });
    render(<ModeSwitch />);
    fireEvent.click(screen.getByRole("radio", { name: /Explore/ }));
    expect(useBaseCamp.getState().mode).toBe("explore");
    expect(useBaseCamp.getState().selected).toBe("rl");
    fireEvent.click(screen.getByRole("radio", { name: "Text" }));
    expect(useBaseCamp.getState().mode).toBe("text");
  });
});
