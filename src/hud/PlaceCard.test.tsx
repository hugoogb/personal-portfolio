// @vitest-environment jsdom
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PLACE_BY_ID } from "@/content/places";
import { PlaceCard } from "@/hud/PlaceCard";
import { useBaseCamp } from "@/store/store";

beforeEach(() => useBaseCamp.setState(useBaseCamp.getInitialState()));
afterEach(() => vi.unstubAllGlobals());

/** A phone: no input points finely. */
const touchOnly = () => vi.stubGlobal("matchMedia", () => ({ matches: false }));

describe("PlaceCard", () => {
  it("shows a project's screenshot, honest status and a real link", () => {
    render(<PlaceCard place={PLACE_BY_ID.rl} />);
    expect(screen.getByRole("img", { name: "Screenshot of ReadLedger" })).toBeTruthy();
    expect(screen.getByText("Status unavailable")).toBeTruthy();
    const open = screen.getByRole("link", { name: /Open site/ });
    expect(open.getAttribute("href")).toBe("https://readledger.app");
    expect(open.getAttribute("rel")).toContain("noopener");
  });

  it("labels a private repo instead of linking it", () => {
    render(<PlaceCard place={PLACE_BY_ID.wt} />);
    const w = screen.getByRole("button", { name: /Private/ });
    expect(w.hasAttribute("disabled")).toBe(true);
    expect(w.getAttribute("title")).toBe("Closed source");
  });

  it("turns E into a GitHub link when there is no stack", () => {
    render(<PlaceCard place={PLACE_BY_ID.post} />);
    expect(screen.getByRole("link", { name: /GitHub/ }).getAttribute("href")).toBe(
      "https://github.com/hugoogb",
    );
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("shows the stack chips on E and moves on with R", () => {
    act(() => useBaseCamp.getState().select("rl"));
    render(<PlaceCard place={PLACE_BY_ID.rl} />);
    expect(screen.queryByText("Prisma")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /Stack/ }));
    expect(screen.getByText("Prisma")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /Next/ }));
    expect(useBaseCamp.getState().selected).toBe("wt");
  });

  it("toggles the details for the narrow sheet", () => {
    render(<PlaceCard place={PLACE_BY_ID.hq} />);
    const toggle = screen.getByRole("button", { name: "Details" });
    fireEvent.click(toggle);
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    expect(toggle.textContent).toBe("Less");
  });

  it("offers the drive with a pointer and keys", () => {
    render(<PlaceCard place={PLACE_BY_ID.arena} />);
    fireEvent.click(screen.getByRole("button", { name: /Take the wheel/ }));
    expect(useBaseCamp.getState().driving).toBe(true);
  });

  it("does not offer the drive on a touch-only device", () => {
    touchOnly();
    render(<PlaceCard place={PLACE_BY_ID.arena} />);
    expect(screen.queryByRole("button", { name: /Take the wheel/ })).toBeNull();
    const q = screen.getByRole("button", { name: /Needs a keyboard/ });
    expect(q.hasAttribute("disabled")).toBe(true);
  });
});
