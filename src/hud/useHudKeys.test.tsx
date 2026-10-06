// @vitest-environment jsdom
import { fireEvent, render } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useHudKeys } from "@/hud/useHudKeys";
import { useBaseCamp } from "@/store/store";

function Probe() {
  useHudKeys();
  return <input aria-label="field" />;
}

const press = (key: string, init: KeyboardEventInit = {}) =>
  fireEvent.keyDown(window, { key, ...init });

// The town is live once the title card has gone; most tests start there.
beforeEach(() => useBaseCamp.setState({ ...useBaseCamp.getInitialState(), introDone: true }));

describe("useHudKeys", () => {
  it("cycles from HQ and deselects on Escape", () => {
    render(<Probe />);
    press("ArrowRight");
    expect(useBaseCamp.getState().selected).toBe("hq");
    press("ArrowRight");
    expect(useBaseCamp.getState().selected).toBe("f1");
    press("ArrowLeft");
    expect(useBaseCamp.getState().selected).toBe("hq");
    press("Escape");
    expect(useBaseCamp.getState().selected).toBeNull();
  });

  it("closes the innermost thing first on Escape", () => {
    render(<Probe />);
    useBaseCamp.setState({ selected: "rl", panel: "settings", consoleOpen: true });
    press("Escape");
    expect(useBaseCamp.getState().consoleOpen).toBe(false);
    press("Escape");
    expect(useBaseCamp.getState().panel).toBeNull();
    press("Escape");
    expect(useBaseCamp.getState().selected).toBeNull();
  });

  it("closes the Brief before anything hidden behind it on Escape", () => {
    render(<Probe />);
    useBaseCamp.setState({ briefOpen: true, panel: "settings" });
    press("Escape");
    expect(useBaseCamp.getState().briefOpen).toBe(false);
    expect(useBaseCamp.getState().panel).toBe("settings");
  });

  it("lets Esc and B close the Brief while the first-visit build-in has not finished", () => {
    render(<Probe />);
    // A deep link opens the Brief over the frozen town: the build-in cannot end behind it.
    useBaseCamp.setState({ introDone: false, briefOpen: true });
    press("b");
    expect(useBaseCamp.getState().briefOpen).toBe(false);
    useBaseCamp.setState({ briefOpen: true });
    press("Escape");
    expect(useBaseCamp.getState().briefOpen).toBe(false);
    // everything else still waits for the town
    press("ArrowRight");
    expect(useBaseCamp.getState().selected).toBeNull();
  });

  it("ignores shortcuts typed into a field", () => {
    const { getByLabelText } = render(<Probe />);
    fireEvent.keyDown(getByLabelText("field"), { key: "ArrowRight" });
    expect(useBaseCamp.getState().selected).toBeNull();
  });

  it("opens the console with Ctrl+K and toggles the stack with E", () => {
    render(<Probe />);
    press("k", { ctrlKey: true });
    expect(useBaseCamp.getState().consoleOpen).toBe(true);
    useBaseCamp.setState({ consoleOpen: false, selected: "rl" });
    press("e");
    expect(useBaseCamp.getState().stackOpen).toBe(true);
  });

  it("only lets Escape through while driving or reading the Brief", () => {
    render(<Probe />);
    useBaseCamp.setState({ driving: true, selected: "arena" });
    press("ArrowRight");
    expect(useBaseCamp.getState().selected).toBe("arena");
    press("Escape");
    expect(useBaseCamp.getState().driving).toBe(false);
    useBaseCamp.setState({ briefOpen: true });
    press("ArrowRight");
    expect(useBaseCamp.getState().selected).toBe("arena");
    press("b");
    expect(useBaseCamp.getState().briefOpen).toBe(false);
  });

  it("keeps the town's shortcuts out of the settings and trophies dialogs", () => {
    render(<Probe />);
    useBaseCamp.setState({ panel: "settings", selected: "hq" });
    press("ArrowRight");
    press("b");
    press("q");
    expect(useBaseCamp.getState().selected).toBe("hq");
    expect(useBaseCamp.getState().briefOpen).toBe(false);
    press("Escape");
    expect(useBaseCamp.getState().panel).toBeNull();
    useBaseCamp.setState({ consoleOpen: true });
    press("ArrowRight");
    expect(useBaseCamp.getState().selected).toBe("hq");
  });

  it("ignores every key until the title card has gone", () => {
    render(<Probe />);
    useBaseCamp.setState({ introDone: false });
    press("ArrowRight");
    press("k", { ctrlKey: true });
    expect(useBaseCamp.getState().selected).toBeNull();
    expect(useBaseCamp.getState().consoleOpen).toBe(false);
  });
});
