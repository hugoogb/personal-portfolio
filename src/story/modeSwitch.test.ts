// @vitest-environment jsdom
import { fireEvent, screen } from "@testing-library/dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mountModeSwitch } from "@/story/modeSwitch";
import { useBaseCamp } from "@/store/store";

let unmount: (() => void) | undefined;
const render = () => {
  unmount = mountModeSwitch(document.body);
};
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

afterEach(() => unmount?.());

describe("mountModeSwitch", () => {
  it("shows the three modes with the current one checked", () => {
    render();
    expect(screen.getByRole("radiogroup", { name: "View" })).toBeTruthy();
    expect(screen.getByRole("radio", { name: "Story" }).getAttribute("aria-checked")).toBe("true");
  });

  it("keeps Explore disabled without WebGL2, and says why", () => {
    document.documentElement.className = "no-webgl";
    render();
    expect(explore().getAttribute("aria-disabled")).toBe("true");
    expect(explore().getAttribute("title")).toMatch(/can't draw the 3D town/);
    fireEvent.click(explore());
    expect(useBaseCamp.getState().mode).toBe("story");
  });

  it("explains a town that is off", () => {
    useBaseCamp.setState({ town: "off" });
    render();
    expect(explore().getAttribute("aria-disabled")).toBe("true");
    expect(explore().getAttribute("title")).toMatch(/can't draw the 3D town/);
  });

  it("offers Explore while the town is still loading, from Text too", () => {
    useBaseCamp.setState({ mode: "text", stop: 3 });
    render();
    expect(explore().getAttribute("aria-disabled")).toBeNull();
    fireEvent.click(explore());
    expect(useBaseCamp.getState().mode).toBe("explore");
    expect(useBaseCamp.getState().selected).toBe("rl");
  });

  it("keeps Explore open after Lite, says so, and turns the 3D back on", () => {
    useBaseCamp.setState({ town: "off", qualityMode: "Lite" });
    render();
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
    render();
    fireEvent.click(explore());
    expect(useBaseCamp.getState().mode).toBe("explore");
    expect(useBaseCamp.getState().selected).toBe("rl");
    fireEvent.click(screen.getByRole("radio", { name: "Text" }));
    expect(useBaseCamp.getState().mode).toBe("text");
  });

  it("is one tab stop, and the arrows move and select, wrapping and skipping a disabled option", () => {
    render();
    const tabs = () => screen.getAllByRole("radio").map((r) => r.getAttribute("tabindex"));
    expect(tabs()).toEqual(["0", "-1", "-1"]);
    fireEvent.keyDown(screen.getByRole("radio", { name: "Story" }), { key: "ArrowLeft" });
    expect(useBaseCamp.getState().mode).toBe("text");
    expect(tabs()).toEqual(["-1", "-1", "0"]);
  });

  it("skips Explore when it is blocked", () => {
    document.documentElement.className = "no-webgl";
    render();
    fireEvent.keyDown(screen.getByRole("radio", { name: "Story" }), { key: "ArrowRight" });
    expect(useBaseCamp.getState().mode).toBe("text");
  });
});
