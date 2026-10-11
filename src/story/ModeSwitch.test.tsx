// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { ModeSwitch } from "@/story/ModeSwitch";
import { useBaseCamp } from "@/store/store";

const explore = () => screen.getByRole("radio", { name: /Explore/ });

beforeEach(() => {
  document.documentElement.className = "";
  useBaseCamp.setState({
    mode: "story",
    town: "loading",
    selected: null,
    stop: 0,
    qualityMode: "auto",
    autoTier: 3,
  });
});

describe("ModeSwitch", () => {
  it("shows the three modes with the current one checked", () => {
    render(<ModeSwitch />);
    expect(screen.getByRole("radiogroup", { name: "View" })).toBeTruthy();
    expect(screen.getByRole("radio", { name: "Story" }).getAttribute("aria-checked")).toBe("true");
  });

  it("keeps Explore disabled without WebGL2, and says why", () => {
    document.documentElement.className = "no-webgl";
    render(<ModeSwitch />);
    expect(explore().getAttribute("aria-disabled")).toBe("true");
    expect(explore().getAttribute("title")).toMatch(/can't draw the 3D town/);
    fireEvent.click(explore());
    expect(useBaseCamp.getState().mode).toBe("story");
  });

  it("explains a town that is off", () => {
    useBaseCamp.setState({ town: "off" });
    render(<ModeSwitch />);
    expect(explore().getAttribute("aria-disabled")).toBe("true");
    expect(explore().getAttribute("title")).toMatch(/can't draw the 3D town/);
  });

  it("offers Explore while the town is still loading, from Text too", () => {
    useBaseCamp.setState({ mode: "text", stop: 3 });
    render(<ModeSwitch />);
    expect(explore().getAttribute("aria-disabled")).toBeNull();
    fireEvent.click(explore());
    expect(useBaseCamp.getState().mode).toBe("explore");
    expect(useBaseCamp.getState().selected).toBe("rl");
  });

  it("keeps Explore open after Lite, says so, and turns the 3D back on", () => {
    useBaseCamp.setState({ town: "off", qualityMode: "Lite" });
    render(<ModeSwitch />);
    expect(explore().getAttribute("aria-disabled")).toBeNull();
    expect(explore().getAttribute("title")).toBe(
      "3D is off (Lite) - choose Explore to turn it back on",
    );
    fireEvent.click(explore());
    const s = useBaseCamp.getState();
    expect([s.mode, s.town, s.qualityMode]).toEqual(["explore", "loading", "auto"]);
  });

  it("switches modes and selects the current stop's place on entering Explore", () => {
    useBaseCamp.setState({ town: "ready", stop: 3 });
    render(<ModeSwitch />);
    fireEvent.click(explore());
    expect(useBaseCamp.getState().mode).toBe("explore");
    expect(useBaseCamp.getState().selected).toBe("rl");
    fireEvent.click(screen.getByRole("radio", { name: "Text" }));
    expect(useBaseCamp.getState().mode).toBe("text");
  });
});
