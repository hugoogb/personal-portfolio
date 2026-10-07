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
afterEach(() => vi.unstubAllGlobals());

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
  it("passes the signal to fetch and answers unknown once aborted", async () => {
    const ac = new AbortController();
    vi.stubGlobal(
      "fetch",
      (_u: string, init: RequestInit) =>
        new Promise((_, reject) =>
          init.signal?.addEventListener("abort", () => reject(new Error("aborted"))),
        ),
    );
    const p = fetchStatus(ac.signal);
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
});
