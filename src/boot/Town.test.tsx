// @vitest-environment jsdom
import { act, render, screen, waitFor } from "@testing-library/react";
import { useEffect } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Town } from "@/boot/Town";
import { READY_TIMEOUT_MS } from "@/boot/world";
import { enterExplore } from "@/story/transitions";
import { bootTier, hasWebgl2, readSignals } from "@/boot/detect";
import { useBaseCamp } from "@/store/store";

const stub = vi.hoisted(() => ({ worldThrows: false, holdReady: false }));
const worldImport = vi.hoisted(() => vi.fn());

vi.mock("@/boot/detect", () => ({ readSignals: vi.fn(), bootTier: vi.fn(), hasWebgl2: vi.fn() }));
vi.mock("@/hud/Hud", () => ({
  Hud: () => <div data-testid="hud" />,
}));
vi.mock("@/world/World", () => {
  function MockWorld({ onReady }: { onReady: () => void }) {
    if (stub.worldThrows) throw new Error("Error creating WebGL context.");
    useEffect(() => {
      if (!stub.holdReady) onReady();
    }, [onReady]);
    return (
      <button type="button" data-testid="world" onClick={onReady}>
        first frame
      </button>
    );
  }
  // The getter runs when Town reads the module's default, so each load is counted.
  return {
    get default() {
      worldImport();
      return MockWorld;
    },
  };
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
  worldImport.mockClear();
  html.className = "";
  vi.mocked(hasWebgl2).mockReset().mockReturnValue(true);
  stub.worldThrows = false;
  stub.holdReady = false;
  sessionStorage.clear();
  document.body.innerHTML = '<div id="town-root"></div>';
  useBaseCamp.setState({ ...useBaseCamp.getInitialState(), mode: "story" });
  vi.mocked(readSignals).mockReset().mockResolvedValue(signals);
  vi.mocked(bootTier).mockReset().mockReturnValue({ auto: 2, tier: 2 });
});

describe("Town", () => {
  it("waits for the browser to be idle before loading the town in Story", async () => {
    const idle: (() => void)[] = [];
    vi.stubGlobal("requestIdleCallback", (cb: () => void) => idle.push(cb));
    try {
      useBaseCamp.setState({ mode: "story", town: "loading" });
      render(<Town />);
      await act(async () => {
        await new Promise((r) => setTimeout(r, 50));
      });
      expect(worldImport).not.toHaveBeenCalled();
      act(() => idle.forEach((cb) => cb()));
      await waitFor(() => expect(worldImport).toHaveBeenCalled());
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("does not probe or load until the first frame has been drawn in Story", async () => {
    const frames: FrameRequestCallback[] = [];
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => frames.push(cb));
    try {
      render(<Town />);
      await act(async () => {
        await new Promise((r) => setTimeout(r, 250));
      });
      expect(hasWebgl2).not.toHaveBeenCalled();
      expect(frames.length).toBeGreaterThan(0);
      act(() => frames.forEach((cb) => cb(0)));
      await waitFor(() => expect(hasWebgl2).toHaveBeenCalled());
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("loads at once in Explore", async () => {
    vi.stubGlobal("requestIdleCallback", () => 0);
    try {
      useBaseCamp.setState({ mode: "explore", town: "loading" });
      render(<Town />);
      await waitFor(() => expect(worldImport).toHaveBeenCalled());
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("does nothing when the idle callback fires after the town was unmounted", async () => {
    const idle: (() => void)[] = [];
    vi.stubGlobal("requestIdleCallback", (cb: () => void) => idle.push(cb));
    try {
      const { unmount } = render(<Town />);
      unmount();
      act(() => idle.forEach((cb) => cb()));
      await act(async () => {});
      expect(readSignals).not.toHaveBeenCalled();
    } finally {
      vi.unstubAllGlobals();
    }
  });

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

  it("loads the town at once on Text -> Explore, and shows the HUD only after the first frame", async () => {
    stub.holdReady = true;
    useBaseCamp.setState({ mode: "text" });
    render(<Town />);
    act(() => enterExplore());
    expect(useBaseCamp.getState().mode).toBe("explore");
    const world = await screen.findByTestId("world");
    expect(screen.queryByTestId("hud")).toBeNull();
    act(() => world.click());
    expect(await screen.findByTestId("hud")).toBeTruthy();
    expect(useBaseCamp.getState().town).toBe("ready");
  });

  it("brings the town back from Lite when Explore is chosen", async () => {
    useBaseCamp.setState({ mode: "explore" });
    render(<Town />);
    await screen.findByTestId("hud");
    act(() => useBaseCamp.getState().setQualityMode("Lite"));
    await waitFor(() => expect(useBaseCamp.getState().town).toBe("off"));
    expect(useBaseCamp.getState().mode).toBe("story");
    act(() => enterExplore());
    expect(await screen.findByTestId("hud")).toBeTruthy();
    const s = useBaseCamp.getState();
    expect([s.mode, s.town, s.qualityMode]).toEqual(["explore", "ready", "auto"]);
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

  it("probes WebGL2 only when it is about to load, and marks the class", async () => {
    render(<Town />);
    await waitFor(() => expect(useBaseCamp.getState().town).toBe("ready"));
    expect(hasWebgl2).toHaveBeenCalledTimes(1);
    expect(html.classList.contains("has-webgl")).toBe(false);
    expect(html.classList.contains("no-webgl")).toBe(false);
  });

  it("keeps Story on the still image without WebGL2, loading nothing and setting no session flag", async () => {
    vi.mocked(hasWebgl2).mockReturnValue(false);
    render(<Town />);
    await waitFor(() => expect(useBaseCamp.getState().town).toBe("off"));
    expect(useBaseCamp.getState().mode).toBe("story");
    expect(html.classList.contains("no-webgl")).toBe(true);
    expect(readSignals).not.toHaveBeenCalled();
    expect(sessionStorage.getItem("bc-town-failed")).toBeNull();
  });

  it("stays on the still image when the town already failed this session, loading nothing", async () => {
    sessionStorage.setItem("bc-town-failed", "1");
    render(<Town />);
    await waitFor(() => expect(useBaseCamp.getState().town).toBe("off"));
    expect(useBaseCamp.getState().mode).toBe("story");
    expect(hasWebgl2).not.toHaveBeenCalled();
    expect(readSignals).not.toHaveBeenCalled();
    expect(worldImport).not.toHaveBeenCalled();
  });

  it("falls back from Explore to Story without WebGL2, keeping the saved choice", async () => {
    vi.mocked(hasWebgl2).mockReturnValue(false);
    useBaseCamp.setState({ mode: "explore", chosenMode: "explore" });
    render(<Town />);
    await waitFor(() => expect(useBaseCamp.getState().town).toBe("off"));
    expect(useBaseCamp.getState().mode).toBe("story");
    expect(useBaseCamp.getState().chosenMode).toBe("explore");
  });

  it("does not probe WebGL2 in Text", async () => {
    useBaseCamp.setState({ mode: "text" });
    render(<Town />);
    await act(async () => {});
    expect(hasWebgl2).not.toHaveBeenCalled();
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
        vi.advanceTimersByTime(300);
      });
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
        vi.advanceTimersByTime(300);
      });
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
