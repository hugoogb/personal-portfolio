// @vitest-environment jsdom
import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import type { PlaceId } from "@/content/types";
import { useBaseCamp } from "@/store/store";
import { enterExplore, enterStory, enterText } from "@/story/transitions";
import { Story } from "@/story/Story";
import { useStoryDriver } from "@/story/useStoryDriver";
import { useStoryStatus } from "@/story/useStoryStatus";

const reduced = vi.hoisted(() => ({ value: false }));
vi.mock("@/utils/motion", () => ({
  prefersReducedMotion: () => reduced.value,
  onMotionPreferenceChange: () => () => {},
}));

function Driver() {
  useStoryDriver();
  useStoryStatus();
  return null;
}

const H = 800;
const setScroll = (y: number) => {
  Object.defineProperty(window, "scrollY", { value: y, configurable: true });
  act(() => {
    window.dispatchEvent(new Event("scroll"));
  });
};
const focus = (stop: number) => stop * H + H / 2 - H / 2; // scrollY that centres a stop

let arrive: Mock<(id: PlaceId) => void>;

beforeEach(() => {
  reduced.value = false;
  Object.defineProperty(window, "innerHeight", { value: H, configurable: true });
  Object.defineProperty(window, "scrollY", { value: 0, configurable: true });
  history.replaceState(null, "", "/");
  arrive = vi.fn<(id: PlaceId) => void>();
  useBaseCamp.setState({ mode: "story", stop: 0, selected: null, arrive, status: "unknown" });
  render(<Story />);
  document.querySelectorAll<HTMLElement>("#story > section[data-stop]").forEach((el, i) => {
    el.getBoundingClientRect = () => ({ top: i * H - window.scrollY }) as DOMRect;
    el.getClientRects = () => [{}] as unknown as DOMRectList;
    Object.defineProperty(el, "offsetHeight", { value: H, configurable: true });
  });
});

afterEach(cleanup);

describe("useStoryDriver", () => {
  it("resuming Story at place Y after a scroll at X never announces X", () => {
    render(<Driver />);
    setScroll(focus(3)); // ReadLedger
    act(() => useBaseCamp.setState({ mode: "explore", selected: "es" }));
    arrive.mockClear();
    const sections = [...document.querySelectorAll<HTMLElement>("#story > section[data-stop]")];
    Element.prototype.scrollIntoView = function (this: Element) {
      Object.defineProperty(window, "scrollY", {
        value: focus(sections.indexOf(this as HTMLElement)),
        configurable: true,
      });
    };
    act(() => enterStory());
    expect(arrive).not.toHaveBeenCalledWith("rl");
    expect(arrive).toHaveBeenCalledWith("es");
    expect(useBaseCamp.getState().stop).toBe(5);
    expect(useBaseCamp.getState().selected).toBe("es");
    expect(location.hash).toBe("#esto-no-es-un-restaurante");
  });

  it("scrolling to ReadLedger's centre sets the stop, the hash, the rail and the selection", () => {
    render(<Driver />);
    setScroll(focus(3));
    expect(useBaseCamp.getState().stop).toBe(3);
    expect(location.hash).toBe("#readledger");
    expect(document.querySelector('[data-rail="rl"]')!.getAttribute("aria-current")).toBe("true");
    expect(document.querySelectorAll('[data-rail][aria-current="true"]')).toHaveLength(1);
    expect(document.querySelector("[data-rail-label]")!.textContent).toBe("ReadLedger");
    expect(document.querySelector("[data-rail-count]")!.textContent).toBe("4 / 8");
    expect(useBaseCamp.getState().selected).toBe("rl");
  });

  it("marks the current stop in the phone chip's list too", () => {
    render(<Driver />);
    setScroll(focus(3));
    expect(document.querySelector('[data-rail-chip="rl"]')!.getAttribute("aria-current")).toBe(
      "true",
    );
    expect(document.querySelectorAll('[data-rail-chip][aria-current="true"]')).toHaveLength(1);
  });

  it("the finale, which is not in the rail, shows Contact in the rail and the chip", () => {
    render(<Driver />);
    setScroll(focus(3));
    setScroll(focus(8)); // the overview section
    expect(useBaseCamp.getState().stop).toBe(8);
    expect(document.querySelector("[data-rail-label]")!.textContent).toBe("Contact");
    expect(document.querySelector("[data-rail-count]")!.textContent).toBe("8 / 8");
    expect(document.querySelectorAll('[data-rail][aria-current="true"]')).toHaveLength(1);
    expect(document.querySelector('[data-rail="contact"]')!.getAttribute("aria-current")).toBe(
      "true",
    );
  });

  it("jumping from the top straight to the finale does the same", () => {
    render(<Driver />);
    setScroll(focus(8));
    expect(document.querySelector("[data-rail-count]")!.textContent).toBe("8 / 8");
    expect(document.querySelector('[data-rail="contact"]')!.getAttribute("aria-current")).toBe(
      "true",
    );
  });

  it("back at the top clears the hash", () => {
    render(<Driver />);
    setScroll(focus(3));
    setScroll(0);
    expect(location.hash).toBe("");
    expect(useBaseCamp.getState().stop).toBe(0);
  });

  it("jumping from the top to Contact arrives once, at Contact only", () => {
    render(<Driver />);
    setScroll(focus(7));
    expect(arrive).toHaveBeenCalledTimes(1);
    expect(arrive).toHaveBeenCalledWith("post");
  });

  it("no arrivals under reduced motion", () => {
    reduced.value = true;
    render(<Driver />);
    setScroll(focus(3));
    expect(useBaseCamp.getState().stop).toBe(3);
    expect(arrive).not.toHaveBeenCalled();
  });

  it("does nothing outside Story", () => {
    useBaseCamp.setState({ mode: "text" });
    render(<Driver />);
    setScroll(focus(3));
    expect(useBaseCamp.getState().stop).toBe(0);
    expect(location.hash).toBe("");
  });
});

describe("switching modes keeps the position", () => {
  const sections = () => [...document.querySelectorAll<HTMLElement>("#story > section[data-stop]")];
  const realScrollTo = window.scrollTo;
  beforeEach(() => {
    Element.prototype.scrollIntoView = function (this: Element) {
      Object.defineProperty(window, "scrollY", {
        value: focus(sections().indexOf(this as HTMLElement)),
        configurable: true,
      });
    };
    window.scrollTo = ((o: ScrollToOptions) =>
      Object.defineProperty(window, "scrollY", {
        value: o.top,
        configurable: true,
      })) as typeof window.scrollTo;
  });
  afterEach(() => {
    window.scrollTo = realScrollTo;
  });

  it("Story -> Explore -> Story comes back to the same scroll position, announcing only that stop", () => {
    render(<Driver />);
    setScroll(focus(4) + 100); // Wrapped Things, a little past its centre
    act(() => enterExplore());
    expect(useBaseCamp.getState().selected).toBe("wt");
    // Explore's layout clamps the page to the top.
    Object.defineProperty(window, "scrollY", { value: 0, configurable: true });
    arrive.mockClear();
    const urls: string[] = [];
    const replace = history.replaceState.bind(history);
    history.replaceState = (d, u, url) => {
      urls.push(String(url));
      replace(d, u, url);
    };
    try {
      act(() => enterStory());
    } finally {
      history.replaceState = replace;
    }
    expect(window.scrollY).toBe(focus(4) + 100);
    expect(useBaseCamp.getState().stop).toBe(4);
    expect(urls).toEqual(["#wrapped-things"]);
    expect(arrive.mock.calls).toEqual([["wt"]]);
  });

  it("Text -> Story lands on the section read in Text, not the stale stop", () => {
    useBaseCamp.setState({ mode: "text", stop: 4, selected: "wt" });
    render(<Driver />);
    setScroll(focus(7)); // Contact, read in Text
    act(() => enterStory());
    expect(useBaseCamp.getState().mode).toBe("story");
    expect(useBaseCamp.getState().stop).toBe(7);
    expect(location.hash).toBe("#contact");
  });

  it("Text, which hides the finale, measures past it: the end of the page is Contact", () => {
    const finale = document.getElementById("explore")!;
    // A display:none box measures as an empty rect at the top of the viewport.
    finale.getClientRects = () => [] as unknown as DOMRectList;
    finale.getBoundingClientRect = () => ({ top: 0 }) as DOMRect;
    Object.defineProperty(finale, "offsetHeight", { value: 0, configurable: true });
    useBaseCamp.setState({ mode: "text", stop: 2, selected: "f1" });
    render(<Driver />);
    setScroll(focus(7) + 300);
    // Explore, not Story: the driver would re-measure the (stubbed) hidden finale.
    act(() => enterExplore());
    expect(useBaseCamp.getState().stop).toBe(7);
    expect(useBaseCamp.getState().selected).toBe("post");
  });

  it("Text -> Explore selects the project read in Text", () => {
    useBaseCamp.setState({ mode: "text", stop: 4, selected: "wt", town: "loading" });
    render(<Driver />);
    setScroll(focus(3)); // ReadLedger
    act(() => enterExplore());
    expect(useBaseCamp.getState().mode).toBe("explore");
    expect(useBaseCamp.getState().selected).toBe("rl");
  });

  it("Explore -> Text lands on the selected place's section", () => {
    useBaseCamp.setState({ mode: "explore", stop: 0, selected: "es" });
    render(<Driver />);
    act(() => enterText());
    expect(useBaseCamp.getState().mode).toBe("text");
    expect(window.scrollY).toBe(focus(5));
    expect(useBaseCamp.getState().stop).toBe(5);
  });
});

describe("useStoryStatus", () => {
  it("fills the pills from the status, and hides them while it is unknown", () => {
    render(<Driver />);
    const pill = document.querySelector<HTMLElement>('[data-status-for="rl"]')!;
    expect(pill.hidden).toBe(true);
    act(() => useBaseCamp.getState().setStatus({ rl: { ok: false, ms: null } }));
    expect(pill.hidden).toBe(false);
    expect(pill.textContent).toBe("Down");
    expect(pill.dataset.state).toBe("down");
    act(() => useBaseCamp.getState().setStatus({ rl: { ok: true, ms: 40 } }));
    expect(pill.textContent).toBe("Live");
    expect(pill.dataset.state).toBe("ok");
    act(() => useBaseCamp.getState().setStatus("unknown"));
    expect(pill.hidden).toBe(true);
  });
});
