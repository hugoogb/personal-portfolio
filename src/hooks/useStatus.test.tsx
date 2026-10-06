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

describe("useStatus", () => {
  it("fills the store on mount", async () => {
    vi.stubGlobal("fetch", () => json({ services: [{ id: "rl", ok: true, ms: 50 }] }));
    render(<Probe />);
    await waitFor(() =>
      expect(useBaseCamp.getState().status).toEqual({ rl: { ok: true, ms: 50 } }),
    );
  });
});
