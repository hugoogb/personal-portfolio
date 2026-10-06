// @vitest-environment jsdom
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Boot } from "@/boot/Boot";
import { READY_TIMEOUT_MS } from "@/boot/world";
import { bootTier, readSignals } from "@/boot/detect";
import { useBaseCamp } from "@/store/store";

const stub = vi.hoisted(() => ({ worldThrows: false }));

vi.mock("@/boot/detect", () => ({ readSignals: vi.fn(), bootTier: vi.fn() }));
vi.mock("@/hud/Hud", () => ({
  Hud: ({ world }: { world: React.ReactNode }) => <div data-testid="hud">{world}</div>,
}));
vi.mock("@/world/World", () => ({
  default: ({ onReady }: { onReady: () => void }) => {
    if (stub.worldThrows) throw new Error("Error creating WebGL context.");
    return (
      <button type="button" onClick={onReady}>
        first frame
      </button>
    );
  },
}));

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
  html.className = "";
  stub.worldThrows = false;
  sessionStorage.clear();
  document.body.innerHTML = '<main id="brief"></main>';
  useBaseCamp.setState(useBaseCamp.getInitialState());
  vi.mocked(readSignals).mockResolvedValue(signals);
});

afterEach(() => {
  window.location.hash = "";
});

describe("Boot", () => {
  it("drops to the Brief when the tier is Lite", async () => {
    html.classList.add("world", "can-world");
    vi.mocked(bootTier).mockReturnValue({ auto: 0, tier: 0 });
    render(<Boot />);
    await waitFor(() => expect(html.classList.contains("world")).toBe(false));
    expect(screen.queryByTestId("hud")).toBeNull();
  });

  it("loads the HUD and the world, then reveals them on the first frame", async () => {
    html.classList.add("world", "can-world");
    vi.mocked(bootTier).mockReturnValue({ auto: 2, tier: 2 });
    render(<Boot />);
    fireEvent.click(await screen.findByRole("button", { name: "first frame" }));
    await waitFor(() => expect(html.classList.contains("world-ready")).toBe(true));
    const s = useBaseCamp.getState();
    expect(s.tier).toBe(2);
    expect(s.seen).toBe(true);
    expect(s.firstVisit).toBe(true);
    expect(document.getElementById("brief")?.hasAttribute("inert")).toBe(true);
  });

  it("leaves the town when the visitor picks Lite", async () => {
    html.classList.add("world", "can-world");
    vi.mocked(bootTier).mockReturnValue({ auto: 3, tier: 3 });
    render(<Boot />);
    await screen.findByTestId("hud");
    act(() => useBaseCamp.getState().setQualityMode("Lite"));
    await waitFor(() => expect(html.classList.contains("world")).toBe(false));
    expect(screen.queryByTestId("hud")).toBeNull();
  });

  it("shows the Brief overlay without making it inert", async () => {
    html.classList.add("world", "can-world");
    vi.mocked(bootTier).mockReturnValue({ auto: 3, tier: 3 });
    render(<Boot />);
    await screen.findByTestId("hud");
    act(() => useBaseCamp.getState().setBriefOpen(true));
    expect(html.classList.contains("brief-open")).toBe(true);
    expect(document.getElementById("brief")?.hasAttribute("inert")).toBe(false);
  });

  it("follows the title card's Read the brief link before the town loads", async () => {
    html.classList.add("world", "can-world");
    vi.mocked(readSignals).mockReturnValue(new Promise(() => {}));
    render(<Boot />);
    window.location.hash = "#brief";
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    await waitFor(() => expect(html.classList.contains("world")).toBe(false));
  });

  it("falls back to the Brief when the world throws while rendering", async () => {
    const quiet = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      html.classList.add("world", "can-world");
      vi.mocked(bootTier).mockReturnValue({ auto: 2, tier: 2 });
      stub.worldThrows = true;
      render(<Boot />);
      await waitFor(() => expect(html.classList.contains("world")).toBe(false));
      expect(screen.queryByTestId("hud")).toBeNull();
      expect(sessionStorage.getItem("bc-town-failed")).toBe("1");
    } finally {
      quiet.mockRestore();
    }
  });

  it("keeps the town when #brief is visited after it loaded, and the overlay handles it", async () => {
    html.classList.add("world", "can-world");
    vi.mocked(bootTier).mockReturnValue({ auto: 3, tier: 3 });
    render(<Boot />);
    await screen.findByTestId("hud");
    window.location.hash = "#brief";
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    expect(html.classList.contains("world")).toBe(true);
    expect(screen.queryByTestId("hud")).toBeTruthy();
  });

  it("resets the overlays when it leaves the town", async () => {
    html.classList.add("world", "can-world");
    vi.mocked(bootTier).mockReturnValue({ auto: 3, tier: 3 });
    render(<Boot />);
    await screen.findByTestId("hud");
    act(() => useBaseCamp.setState({ briefOpen: true, panel: "settings", consoleOpen: true }));
    act(() => useBaseCamp.getState().setQualityMode("Lite"));
    await waitFor(() => expect(html.classList.contains("world")).toBe(false));
    const s = useBaseCamp.getState();
    expect([s.briefOpen, s.panel, s.consoleOpen]).toEqual([false, null, false]);
  });

  it("moves focus to the Brief when it leaves the town", async () => {
    html.classList.add("world", "can-world");
    vi.mocked(bootTier).mockReturnValue({ auto: 3, tier: 3 });
    render(<Boot />);
    await screen.findByTestId("hud");
    act(() => useBaseCamp.getState().setQualityMode("Lite"));
    await waitFor(() => expect(document.activeElement).toBe(document.getElementById("brief")));
  });

  it("gives up on a stalled GPU check once the ready timeout passes", () => {
    vi.useFakeTimers();
    try {
      html.classList.add("world", "can-world");
      vi.mocked(readSignals).mockReturnValue(new Promise(() => {}));
      render(<Boot />);
      act(() => {
        vi.advanceTimersByTime(READY_TIMEOUT_MS);
      });
      expect(html.classList.contains("world")).toBe(false);
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
      html.classList.add("world", "can-world");
      vi.mocked(readSignals).mockReturnValue(new Promise(() => {}));
      render(<Boot />);
      act(() => {
        vi.advanceTimersByTime(READY_TIMEOUT_MS);
      });
      expect(html.classList.contains("world")).toBe(true);
      hidden = false;
      act(() => {
        vi.advanceTimersByTime(READY_TIMEOUT_MS);
      });
      expect(html.classList.contains("world")).toBe(false);
    } finally {
      if (original) Object.defineProperty(document, "hidden", original);
      else Reflect.deleteProperty(document, "hidden");
      vi.useRealTimers();
    }
  });

  it("offers the town from the Brief when WebGL works, and enters it on Low", async () => {
    html.classList.add("has-webgl");
    vi.mocked(bootTier).mockReturnValue({ auto: 1, tier: 1 });
    render(<Boot />);
    sessionStorage.setItem("bc-town-failed", "1");
    fireEvent.click(screen.getByRole("button", { name: "Enter the town anyway" }));
    expect(sessionStorage.getItem("bc-town-failed")).toBeNull();
    expect(html.classList.contains("world")).toBe(true);
    expect(useBaseCamp.getState().qualityMode).toBe("Low");
    expect(await screen.findByTestId("hud")).toBeTruthy();
  });

  it("offers nothing without WebGL", () => {
    render(<Boot />);
    expect(screen.queryByRole("button")).toBeNull();
  });
});
