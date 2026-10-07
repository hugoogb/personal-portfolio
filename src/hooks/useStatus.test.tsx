// @vitest-environment jsdom
import { render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchStatus, useStatus } from "@/hooks/useStatus";
import { useBaseCamp } from "@/store/store";

const json = (body: unknown, ok = true) =>
  Promise.resolve({ ok, json: () => Promise.resolve(body) } as Response);

function Probe() {
  useStatus();
  return null;
}

beforeEach(() => useBaseCamp.setState(useBaseCamp.getInitialState()));
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("fetchStatus", () => {
  it("maps probes to a status map", async () => {
    vi.stubGlobal("fetch", () =>
      json({
        services: [
          { id: "rl", ok: true, ms: 80 },
          { id: "es", ok: false, ms: null },
        ],
      }),
    );
    expect(await fetchStatus()).toEqual({ rl: { ok: true, ms: 80 }, es: { ok: false, ms: null } });
  });

  it("is honest when the endpoint fails or answers nonsense", async () => {
    vi.stubGlobal("fetch", () => Promise.reject(new Error("offline")));
    expect(await fetchStatus()).toBe("unknown");
    vi.stubGlobal("fetch", () => json("<html>404</html>", false));
    expect(await fetchStatus()).toBe("unknown");
    vi.stubGlobal("fetch", () => json({ services: "nope" }));
    expect(await fetchStatus()).toBe("unknown");
  });

  it("skips entries without an id and treats a missing ms as null", async () => {
    vi.stubGlobal("fetch", () => json({ services: [{ ok: true }, { id: "wt", ok: true }] }));
    expect(await fetchStatus()).toEqual({ wt: { ok: true, ms: null } });
  });
});

describe("fetchStatus timeout", () => {
  it("hands fetch the exact signal and stays pending until it aborts", async () => {
    const ac = new AbortController();
    let seen: AbortSignal | null | undefined;
    vi.stubGlobal("fetch", (_u: string, init?: RequestInit) => {
      seen = init?.signal;
      return new Promise((_, reject) =>
        init?.signal?.addEventListener("abort", () => reject(new Error("aborted"))),
      );
    });
    const p = fetchStatus(ac.signal);
    let settled = false;
    void p.then(() => (settled = true));
    await Promise.resolve();
    await Promise.resolve();
    expect(seen).toBe(ac.signal);
    expect(settled).toBe(false);
    ac.abort();
    expect(await p).toBe("unknown");
  });
});

describe("useStatus", () => {
  it("never lets an older response overwrite a newer one", async () => {
    vi.useFakeTimers();
    try {
      const resolvers: ((r: Response) => void)[] = [];
      vi.stubGlobal("fetch", () => new Promise<Response>((res) => resolvers.push(res)));
      render(<Probe />);
      expect(resolvers).toHaveLength(1);
      await vi.advanceTimersByTimeAsync(60_000);
      expect(resolvers).toHaveLength(2);
      const reply = (id: string) => ({
        ok: true,
        json: () => Promise.resolve({ services: [{ id, ok: true, ms: 1 }] }),
      });
      resolvers[1](reply("es") as unknown as Response);
      await vi.advanceTimersByTimeAsync(0);
      resolvers[0](reply("rl") as unknown as Response);
      await vi.advanceTimersByTimeAsync(0);
      expect(useBaseCamp.getState().status).toEqual({ es: { ok: true, ms: 1 } });
    } finally {
      vi.useRealTimers();
    }
  });

  it("fills the store on mount", async () => {
    vi.stubGlobal("fetch", () => json({ services: [{ id: "rl", ok: true, ms: 50 }] }));
    render(<Probe />);
    await waitFor(() =>
      expect(useBaseCamp.getState().status).toEqual({ rl: { ok: true, ms: 50 } }),
    );
  });

  it("gives each request a 10 s timeout signal and aborts it on unmount", async () => {
    const timeout = new AbortController();
    vi.spyOn(AbortSignal, "timeout").mockImplementation((ms) => {
      expect(ms).toBe(10_000);
      return timeout.signal;
    });
    const signals: (AbortSignal | null | undefined)[] = [];
    vi.stubGlobal("fetch", (_u: string, init?: RequestInit) => {
      signals.push(init?.signal);
      return new Promise((_, reject) =>
        init?.signal?.addEventListener("abort", () => reject(new Error("aborted"))),
      );
    });
    useBaseCamp.setState({ status: { rl: { ok: true, ms: 1 } } });
    const first = render(<Probe />);
    expect(signals[0]).toBeInstanceOf(AbortSignal);
    expect(signals[0]!.aborted).toBe(false);
    timeout.abort();
    expect(signals[0]!.aborted).toBe(true);
    await waitFor(() => expect(useBaseCamp.getState().status).toBe("unknown"));
    first.unmount();

    vi.spyOn(AbortSignal, "timeout").mockImplementation(() => new AbortController().signal);
    const second = render(<Probe />);
    expect(signals[1]!.aborted).toBe(false);
    second.unmount();
    expect(signals[1]!.aborted).toBe(true);
  });
});

describe("useStatus without AbortSignal.any", () => {
  const any = AbortSignal.any;
  beforeEach(() => {
    // Safari < 17.4, Chrome < 116, Firefox < 124.
    delete (AbortSignal as { any?: unknown }).any;
  });
  afterEach(() => {
    AbortSignal.any = any;
  });

  it("still loads status, with no unhandled rejection", async () => {
    const rejections: unknown[] = [];
    const onRej = (e: unknown) => rejections.push(e);
    process.on("unhandledRejection", onRej);
    vi.stubGlobal("fetch", () => json({ services: [{ id: "rl", ok: true, ms: 50 }] }));
    render(<Probe />);
    await waitFor(() =>
      expect(useBaseCamp.getState().status).toEqual({ rl: { ok: true, ms: 50 } }),
    );
    await new Promise((r) => setTimeout(r, 0));
    process.off("unhandledRejection", onRej);
    expect(rejections).toEqual([]);
  });

  it("still times out after 10 s and aborts on unmount", async () => {
    vi.useFakeTimers();
    try {
      const signals: (AbortSignal | null | undefined)[] = [];
      vi.stubGlobal("fetch", (_u: string, init?: RequestInit) => {
        signals.push(init?.signal);
        return new Promise((_, reject) =>
          init?.signal?.addEventListener("abort", () => reject(new Error("aborted"))),
        );
      });
      useBaseCamp.setState({ status: { rl: { ok: true, ms: 1 } } });
      const first = render(<Probe />);
      expect(signals[0]!.aborted).toBe(false);
      await vi.advanceTimersByTimeAsync(10_000);
      expect(signals[0]!.aborted).toBe(true);
      expect(useBaseCamp.getState().status).toBe("unknown");
      first.unmount();

      const second = render(<Probe />);
      expect(signals[1]!.aborted).toBe(false);
      second.unmount();
      expect(signals[1]!.aborted).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });
});
