// @vitest-environment jsdom
import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Hud } from "@/hud/Hud";
import { useBaseCamp } from "@/store/store";

beforeEach(() => useBaseCamp.setState(useBaseCamp.getInitialState()));
afterEach(() => {
  window.location.hash = "";
});

describe("Hud", () => {
  it("keeps one live region across selections, so the card is announced", () => {
    const { container } = render(<Hud />);
    const slot = container.querySelector(".card-slot");
    expect(slot?.getAttribute("aria-live")).toBe("polite");
    act(() => useBaseCamp.getState().select("hq"));
    expect(container.querySelector(".card-slot")).toBe(slot);
    expect(slot?.querySelector(".card")).toBeTruthy();
    expect(container.querySelector(".card[aria-live]")).toBeNull();
  });

  it("is inert until the build-in has finished", () => {
    const { container } = render(<Hud />);
    const stage = container.querySelector(".stage");
    expect(stage?.hasAttribute("inert")).toBe(true);
    act(() => useBaseCamp.getState().markIntroDone());
    expect(stage?.hasAttribute("inert")).toBe(false);
  });

  it("selects HQ on mount, or the place in the URL hash", () => {
    const first = render(<Hud />);
    expect(useBaseCamp.getState().selected).toBe("hq");
    first.unmount();
    window.location.hash = "#readledger";
    render(<Hud />);
    expect(useBaseCamp.getState().selected).toBe("rl");
  });

  it("holds no canvas: the town is drawn in #town-root", () => {
    const { container } = render(<Hud />);
    expect(container.querySelector(".stage__canvas")).toBeNull();
    expect(container.querySelector(".brief-close")).toBeNull();
  });
});
