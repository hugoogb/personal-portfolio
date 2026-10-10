// @vitest-environment jsdom
import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import type { PlaceId } from "@/content/types";
import { useBaseCamp } from "@/store/store";
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
    Object.defineProperty(el, "offsetHeight", { value: H, configurable: true });
  });
});

afterEach(cleanup);

describe("useStoryDriver", () => {
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
