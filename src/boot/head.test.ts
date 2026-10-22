import { describe, expect, it } from "vitest";
import { NIGHT_AFTER, NIGHT_BEFORE, bootHead, headScript } from "@/boot/head";
import { EXPLORE_ONLY_SLUGS } from "@/content/tour";
import { nightAmount } from "@/world/lib/sun";

interface Env {
  stored?: Record<string, string>;
  storageThrows?: boolean;
  townFailed?: boolean;
  reducedMotion?: boolean;
  saveData?: boolean;
  hash?: string;
  hour?: number;
}

const fake = (env: Env = {}) => {
  const props = new Map<string, string>();
  const classes = new Set<string>();
  const state = { probed: false };
  const doc = {
    documentElement: {
      style: { setProperty: (k: string, v: string) => void props.set(k, v) },
      classList: {
        add: (...names: string[]) => names.forEach((c) => classes.add(c)),
        contains: (c: string) => classes.has(c),
      },
    },
    // The head script must never create a canvas: that is a WebGL probe before first paint.
    createElement: () => {
      state.probed = true;
      throw new Error("the head script must not probe WebGL");
    },
  };
  const storage = { getItem: (k: string) => env.stored?.[k] ?? null };
  const session = {
    getItem: (k: string) => (k === "bc-town-failed" && env.townFailed ? "1" : null),
  };
  const win = {
    sessionStorage: session,
    location: { hash: env.hash ?? "" },
    get localStorage() {
      if (env.storageThrows) throw new Error("SecurityError");
      return storage;
    },
    matchMedia: (q: string) => ({ matches: q.includes("reduce") && Boolean(env.reducedMotion) }),
    navigator: { connection: env.saveData ? { saveData: true } : undefined },
  };
  return { doc, win, props, classes, state };
};

const OPTS = {
  exploreOnly: EXPLORE_ONLY_SLUGS,
  nightBefore: NIGHT_BEFORE,
  nightAfter: NIGHT_AFTER,
};
/** A Date whose Barcelona hour is `h` (10 Oct is CEST, UTC+2). */
const dateAt = (h: number) => new Date(Date.UTC(2026, 9, 10, h - 2, 0));
const saved = (mode: string) => ({
  bc: JSON.stringify({ state: { chosenMode: mode }, version: 1 }),
});
const modes = (classes: Set<string>) => [...classes].filter((c) => c.startsWith("mode-"));

const boot = (env: Env = {}) => {
  const f = fake(env);
  bootHead(f.doc as unknown as Document, f.win as unknown as Window, OPTS, dateAt(env.hour ?? 12));
  return f;
};

describe("bootHead", () => {
  it("paints a stored accent before first paint", () => {
    expect(boot({ stored: { color: "#10b981" } }).props.get("--primary-color")).toBe("#10b981");
  });

  it.each(["red", "javascript:alert(1)", "#fff", "url(x)"])("ignores a stored %s", (value) => {
    expect(boot({ stored: { color: value } }).props.has("--primary-color")).toBe(false);
  });

  it("starts a capable device in Story, with no legacy town classes", () => {
    const f = boot();
    expect(f.classes.has("mode-story")).toBe(true);
    for (const legacy of ["can-world", "world", "world-ready", "brief-open"])
      expect(f.classes.has(legacy)).toBe(false);
  });

  it.each([
    ["with reduced motion", { reducedMotion: true }],
    ["with Save-Data", { saveData: true }],
    [
      "when the visitor chose Lite",
      { stored: { bc: JSON.stringify({ state: { qualityMode: "Lite" }, version: 1 }) } },
    ],
  ])("starts a device %s in Text", (_label, env) => {
    expect(boot(env).classes.has("mode-text")).toBe(true);
  });

  it("survives a corrupt saved record and still paints the accent", () => {
    const f = boot({ stored: { color: "#10b981", bc: "{oops" } });
    expect(f.props.get("--primary-color")).toBe("#10b981");
    expect(f.classes.has("mode-story")).toBe(true);
  });

  it("survives blocked storage", () => {
    const f = boot({ storageThrows: true });
    expect(f.props.size).toBe(0);
    expect(f.classes.has("mode-story")).toBe(true);
  });

  it("never probes WebGL: that waits for Town, after first paint", () => {
    const f = boot();
    expect(f.state.probed).toBe(false);
  });

  it("no longer lets a saved manual quality outrank reduced motion or Save-Data: the mode rules decide", () => {
    const stored = { bc: JSON.stringify({ state: { qualityMode: "Low" } }) };
    expect(boot({ stored, reducedMotion: true }).classes.has("mode-text")).toBe(true);
    expect(boot({ stored, saveData: true }).classes.has("mode-text")).toBe(true);
  });

  it("adds only the mode class on a plain device", () => {
    expect([...boot().classes]).toEqual(["mode-story"]);
  });
});

describe("mode before first paint", () => {
  it("starts in Story by default", () => expect(modes(boot().classes)).toEqual(["mode-story"]));
  it("starts in Text with reduced motion or Save-Data, and in Story after a failed town", () => {
    for (const env of [{ reducedMotion: true }, { saveData: true }])
      expect(modes(boot(env).classes)).toEqual(["mode-text"]);
    expect(modes(boot({ townFailed: true }).classes)).toEqual(["mode-story"]);
  });
  it("restores a saved mode", () => {
    expect(modes(boot({ stored: saved("explore") }).classes)).toEqual(["mode-explore"]);
    expect(modes(boot({ stored: saved("text") }).classes)).toEqual(["mode-text"]);
  });
  it("turns a saved Explore into Story after a failed town", () => {
    expect(modes(boot({ townFailed: true, stored: saved("explore") }).classes)).toEqual([
      "mode-story",
    ]);
  });
  it("reads the chosen mode", () => {
    const record = (state: object) => ({ bc: JSON.stringify({ state, version: 1 }) });
    expect(modes(boot({ stored: record({ chosenMode: "text" }) }).classes)).toEqual(["mode-text"]);
    // A record written by the new store with nothing chosen: the signals decide.
    expect(modes(boot({ stored: record({ chosenMode: null }) }).classes)).toEqual(["mode-story"]);
    expect(
      modes(boot({ stored: record({ chosenMode: null }), reducedMotion: true }).classes),
    ).toEqual(["mode-text"]);
  });
  it("lets #text win over a saved mode", () => {
    expect(modes(boot({ hash: "#text", stored: saved("explore") }).classes)).toEqual(["mode-text"]);
  });
  it("opens Explore for an explore-only place, and Story after a failed town", () => {
    expect(modes(boot({ hash: "#Stadium" }).classes)).toEqual(["mode-explore"]);
    expect(modes(boot({ hash: "#stadium", townFailed: true }).classes)).toEqual(["mode-story"]);
  });
  it("leaves the mode alone for a tour section's hash", () => {
    expect(modes(boot({ hash: "#readledger", stored: saved("text") }).classes)).toEqual([
      "mode-text",
    ]);
  });
  it("ignores a corrupt saved mode", () => {
    expect(modes(boot({ stored: { bc: "{not json" } }).classes)).toEqual(["mode-story"]);
  });
  it("marks night exactly when the town's lighting is mostly night", () => {
    for (let h = 0; h < 24; h++)
      expect(boot({ hour: h }).classes.has("night")).toBe(nightAmount(h) > 0.5);
  });
  it("reads Barcelona's clock like Intl does, through both daylight-saving changes", () => {
    const intlHour = (d: Date) => {
      const p = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Europe/Madrid",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      }).formatToParts(d);
      const read = (t: string) => Number(p.find((x) => x.type === t)?.value);
      return read("hour") + read("minute") / 60;
    };
    const start = Date.UTC(2026, 0, 1);
    for (let t = start; t < Date.UTC(2028, 0, 1); t += 20 * 60_000) {
      const now = new Date(t);
      const f = fake();
      bootHead(f.doc as unknown as Document, f.win as unknown as Window, OPTS, now);
      const h = intlHour(now);
      expect(f.classes.has("night"), now.toISOString()).toBe(h < NIGHT_BEFORE || h > NIGHT_AFTER);
    }
  });
  it("passes its options in the shipped script", () => {
    expect(headScript).toContain(JSON.stringify(EXPLORE_ONLY_SLUGS[0]));
    expect(headScript).toContain(JSON.stringify([...EXPLORE_ONLY_SLUGS].sort()));
  });
});

describe("headScript", () => {
  it("runs on its own, with no outside references", () => {
    const f = fake({ stored: { color: "#3142db" } });
    new Function("document", "window", headScript)(f.doc, f.win);
    expect(f.props.get("--primary-color")).toBe("#3142db");
    expect(f.classes.has("mode-story")).toBe(true);
  });
});
