// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { act } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Mode } from "@/boot/mode";
import { useBaseCamp } from "@/store/store";
import { useHashRoutes } from "@/story/useHashRoutes";

function Routes() {
  useHashRoutes();
  return null;
}

/** A hash change while the page is open, as the browser reports it. */
const go = (hash: string) =>
  act(() => {
    history.replaceState(null, "", hash);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  });

const start = (mode: Mode) => {
  document.documentElement.className = `mode-${mode}`;
  useBaseCamp.setState({
    mode,
    chosenMode: mode,
    selected: null,
    stop: 3,
    town: "ready",
    qualityMode: "auto",
  });
  render(<Routes />);
};

const state = () => {
  const s = useBaseCamp.getState();
  return { mode: s.mode, selected: s.selected, chosenMode: s.chosenMode };
};

beforeEach(() => {
  history.replaceState(null, "", "/");
  Element.prototype.scrollIntoView = () => {};
});
afterEach(cleanup);

// Spec 5.6, one block per row.
describe("a tour section's hash (#<project>, #about, #contact)", () => {
  it.each(["#readledger", "#about", "#contact"])(
    "%s in Story leaves the scrolling to the browser",
    (hash) => {
      start("story");
      go(hash);
      expect(state()).toEqual({ mode: "story", selected: null, chosenMode: "story" });
    },
  );

  it.each([
    ["#readledger", "rl"],
    ["#about", "hq"],
    ["#contact", "post"],
    ["#ReadLedger", "rl"],
  ] as const)("%s in Explore selects %s", (hash, id) => {
    start("explore");
    go(hash);
    expect(state()).toEqual({ mode: "explore", selected: id, chosenMode: "explore" });
  });

  it.each(["#readledger", "#about", "#contact"])(
    "%s in Text leaves the scrolling to the browser",
    (hash) => {
      start("text");
      go(hash);
      expect(state()).toEqual({ mode: "text", selected: null, chosenMode: "text" });
    },
  );
});

describe("an explore-only place's hash (#stadium...)", () => {
  it("in Story switches to Explore and selects it, without saving Explore as the choice", () => {
    start("story");
    go("#Stadium");
    expect(state()).toEqual({ mode: "explore", selected: "stadium", chosenMode: "story" });
  });

  it("in Explore selects it", () => {
    start("explore");
    go("#arena");
    expect(state()).toEqual({ mode: "explore", selected: "arena", chosenMode: "explore" });
  });

  it("in Text is a no-op", () => {
    start("text");
    go("#stadium");
    expect(state()).toEqual({ mode: "text", selected: null, chosenMode: "text" });
  });
});

describe("#text", () => {
  it.each(["story", "explore"] as const)(
    "from %s switches to Text, without saving Text as the choice",
    (mode) => {
      start(mode);
      go("#text");
      expect(useBaseCamp.getState().mode).toBe("text");
      expect(useBaseCamp.getState().chosenMode).toBe(mode);
    },
  );

  it("in Text is a no-op: no scroll back to an old stop", () => {
    let scrolled = 0;
    Element.prototype.scrollIntoView = () => void scrolled++;
    start("text");
    go("#TEXT");
    expect(state()).toEqual({ mode: "text", selected: null, chosenMode: "text" });
    expect(scrolled).toBe(0);
  });
});

describe("an unknown hash", () => {
  it.each(["story", "explore", "text"] as const)("changes nothing in %s", (mode) => {
    start(mode);
    go("#nowhere");
    expect(state()).toEqual({ mode, selected: null, chosenMode: mode });
  });
});
