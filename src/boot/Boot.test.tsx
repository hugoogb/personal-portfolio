// @vitest-environment jsdom
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Boot } from "@/boot/Boot";
import { READY_TIMEOUT_MS } from "@/boot/world";
import { bootTier, readSignals } from "@/boot/detect";
import { useBaseCamp } from "@/store/store";

vi.mock("@/boot/detect", () => ({ readSignals: vi.fn(), bootTier: vi.fn() }));
vi.mock("@/hud/Hud", () => ({
  Hud: ({ world }: { world: React.ReactNode }) => <div data-testid="hud">{world}</div>,
}));
vi.mock("@/world/World", () => ({
  default: ({ onReady }: { onReady: () => void }) => (
    <button type="button" onClick={onReady}>
      first frame
    </button>
  ),
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
    expect(s.introDone).toBe(true);
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
    } finally {
      vi.useRealTimers();
    }
  });

  it("offers the town from the Brief when WebGL works, and enters it on Low", async () => {
    html.classList.add("has-webgl");
    vi.mocked(bootTier).mockReturnValue({ auto: 1, tier: 1 });
    render(<Boot />);
    fireEvent.click(screen.getByRole("button", { name: "Enter the town anyway" }));
    expect(html.classList.contains("world")).toBe(true);
    expect(useBaseCamp.getState().qualityMode).toBe("Low");
    expect(await screen.findByTestId("hud")).toBeTruthy();
  });

  it("offers nothing without WebGL", () => {
    render(<Boot />);
    expect(screen.queryByRole("button")).toBeNull();
  });
});
