// @vitest-environment jsdom
import { act, render } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { Hud } from "@/hud/Hud";
import { useBaseCamp } from "@/store/store";

beforeEach(() => useBaseCamp.setState(useBaseCamp.getInitialState()));

describe("Hud", () => {
  it("keeps one live region across selections, so the card is announced", () => {
    const { container } = render(<Hud world={null} />);
    const slot = container.querySelector(".card-slot");
    expect(slot?.getAttribute("aria-live")).toBe("polite");
    act(() => useBaseCamp.getState().select("hq"));
    expect(container.querySelector(".card-slot")).toBe(slot);
    expect(slot?.querySelector(".card")).toBeTruthy();
    expect(container.querySelector(".card[aria-live]")).toBeNull();
  });

  it("is inert until the title card has gone", () => {
    const { container } = render(<Hud world={null} />);
    const stage = container.querySelector(".stage");
    expect(stage?.hasAttribute("inert")).toBe(true);
    act(() => useBaseCamp.getState().markIntroDone());
    expect(stage?.hasAttribute("inert")).toBe(false);
  });
});
