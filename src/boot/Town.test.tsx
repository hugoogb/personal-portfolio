// @vitest-environment jsdom
import { act, render, screen, waitFor } from "@testing-library/react";
import { useEffect } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Town } from "@/boot/Town";
import { READY_TIMEOUT_MS } from "@/boot/world";
import { bootTier, readSignals } from "@/boot/detect";
import { useBaseCamp } from "@/store/store";

const stub = vi.hoisted(() => ({ worldThrows: false }));

vi.mock("@/boot/detect", () => ({ readSignals: vi.fn(), bootTier: vi.fn() }));
vi.mock("@/hud/Hud", () => ({
  Hud: () => <div data-testid="hud" />,
}));
vi.mock("@/world/World", () => {
  function MockWorld({ onReady }: { onReady: () => void }) {
    if (stub.worldThrows) throw new Error("Error creating WebGL context.");
    useEffect(() => onReady(), [onReady]);
    return <div data-testid="world" />;
  }
  return { default: MockWorld };
});

const html = document.documentElement;
const signals = {
  webgl: true,
  reducedMotion: false,
  saveData: false,
  gpuTier: 3 as const,
  cores: 8,
  memoryGb: 16,
  coarsePointer: false,
};

beforeEach(() => {
  html.className = "has-webgl";
  stub.worldThrows = false;
  sessionStorage.clear();
  document.body.innerHTML = '<div id="town-root"></div>';
  useBaseCamp.setState({ ...useBaseCamp.getInitialState(), mode: "story" });
  vi.mocked(readSignals).mockReset().mockResolvedValue(signals);
  vi.mocked(bootTier).mockReset().mockReturnValue({ auto: 2, tier: 2 });
});

describe("Town", () => {
  it("loads nothing in Text", async () => {
    useBaseCamp.setState({ mode: "text" });
    render(<Town />);
    await act(async () => {});
    expect(readSignals).not.toHaveBeenCalled();
    expect(screen.queryByTestId("world")).toBeNull();
    expect(screen.queryByTestId("hud")).toBeNull();
  });

  it("loads the town in Story, mounts no HUD, and marks it ready on the first frame", async () => {
    render(<Town />);
    await screen.findByTestId("world");
    await waitFor(() => expect(useBaseCamp.getState().town).toBe("ready"));
    expect(html.classList.contains("town-ready")).toBe(true);
    expect(screen.queryByTestId("hud")).toBeNull();
    const s = useBaseCamp.getState();
    expect(s.tier).toBe(2);
    expect(s.seen).toBe(true);
    expect(s.firstVisit).toBe(true);
  });

  it("mounts the HUD in Explore", async () => {
    useBaseCamp.setState({ mode: "explore" });
    render(<Town />);
    expect(await screen.findByTestId("hud")).toBeTruthy();
  });

  it("renders the canvas into #town-root", async () => {
    render(<Town />);
    const world = await screen.findByTestId("world");
    expect(world.parentElement?.id).toBe("town-root");
  });

  it("turns the town off for tier 0 and keeps the mode", async () => {
    vi.mocked(bootTier).mockReturnValue({ auto: 0, tier: 0 });
    render(<Town />);
    await waitFor(() => expect(useBaseCamp.getState().town).toBe("off"));
    expect(useBaseCamp.getState().mode).toBe("story");
    expect(sessionStorage.getItem("bc-town-failed")).toBeNull();
    expect(screen.queryByTestId("world")).toBeNull();
  });

  it("turns the town off without WebGL2, without loading anything, even in Text", async () => {
    html.className = "";
    useBaseCamp.setState({ mode: "text" });
    render(<Town />);
    await waitFor(() => expect(useBaseCamp.getState().town).toBe("off"));
    expect(readSignals).not.toHaveBeenCalled();
  });

  it("turns the town off when the world throws, sets the session flag, and leaves Explore for Story", async () => {
    const quiet = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      useBaseCamp.setState({ mode: "explore" });
      stub.worldThrows = true;
      render(<Town />);
      await waitFor(() => expect(useBaseCamp.getState().town).toBe("off"));
      expect(sessionStorage.getItem("bc-town-failed")).toBe("1");
      expect(useBaseCamp.getState().mode).toBe("story");
      expect(screen.queryByTestId("hud")).toBeNull();
    } finally {
      quiet.mockRestore();
    }
  });

  it("drops the town when the visitor picks Lite, and keeps the story", async () => {
    useBaseCamp.setState({ mode: "explore" });
    render(<Town />);
    await screen.findByTestId("hud");
    await waitFor(() => expect(html.classList.contains("town-ready")).toBe(true));
    act(() => useBaseCamp.setState({ panel: "settings", consoleOpen: true }));
    act(() => useBaseCamp.getState().setQualityMode("Lite"));
    await waitFor(() => expect(useBaseCamp.getState().town).toBe("off"));
    const s = useBaseCamp.getState();
    expect([s.mode, s.panel, s.consoleOpen]).toEqual(["story", null, false]);
    expect(html.classList.contains("town-ready")).toBe(false);
    expect(screen.queryByTestId("world")).toBeNull();
    expect(sessionStorage.getItem("bc-town-failed")).toBeNull();
  });

  it("unmounts the town in Text and loads it again for Story", async () => {
    render(<Town />);
    await waitFor(() => expect(useBaseCamp.getState().town).toBe("ready"));
    act(() => useBaseCamp.getState().setMode("text"));
    expect(screen.queryByTestId("world")).toBeNull();
    expect(html.classList.contains("town-ready")).toBe(false);
    expect(useBaseCamp.getState().town).toBe("loading");
    act(() => useBaseCamp.getState().setMode("story"));
    await screen.findByTestId("world");
    await waitFor(() => expect(useBaseCamp.getState().town).toBe("ready"));
  });

  it("gives up on a stalled GPU check once the ready timeout passes", () => {
    vi.useFakeTimers();
    try {
      vi.mocked(readSignals).mockReturnValue(new Promise(() => {}));
      render(<Town />);
      act(() => {
        vi.advanceTimersByTime(READY_TIMEOUT_MS);
      });
      expect(useBaseCamp.getState().town).toBe("off");
      expect(useBaseCamp.getState().mode).toBe("story");
      expect(sessionStorage.getItem("bc-town-failed")).toBe("1");
    } finally {
      vi.useRealTimers();
    }
  });

  it("does not time out a hidden tab, then times out once it is visible", () => {
    vi.useFakeTimers();
    const original = Object.getOwnPropertyDescriptor(document, "hidden");
    let hidden = true;
    Object.defineProperty(document, "hidden", { configurable: true, get: () => hidden });
    try {
      vi.mocked(readSignals).mockReturnValue(new Promise(() => {}));
      render(<Town />);
      act(() => {
        vi.advanceTimersByTime(READY_TIMEOUT_MS);
      });
      expect(useBaseCamp.getState().town).toBe("loading");
      hidden = false;
      act(() => {
        vi.advanceTimersByTime(READY_TIMEOUT_MS);
      });
      expect(useBaseCamp.getState().town).toBe("off");
    } finally {
      if (original) Object.defineProperty(document, "hidden", original);
      else Reflect.deleteProperty(document, "hidden");
      vi.useRealTimers();
    }
  });
});
