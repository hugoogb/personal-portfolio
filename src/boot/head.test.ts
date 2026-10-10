import { describe, expect, it } from "vitest";
import { NIGHT_AFTER, NIGHT_BEFORE, bootHead, headScript } from "@/boot/head";
import { EXPLORE_ONLY_SLUGS } from "@/content/tour";
import { nightAmount } from "@/world/lib/sun";

interface Env {
  stored?: Record<string, string>;
  storageThrows?: boolean;
  webgl?: boolean;
  webgl1Only?: boolean;
  townFailed?: boolean;
  reducedMotion?: boolean;
  saveData?: boolean;
  hash?: string;
  hour?: number;
}

const fake = (env: Env = {}) => {
  const props = new Map<string, string>();
  const classes = new Set<string>();
  const state = { lost: false };
  const doc = {
    documentElement: {
      style: { setProperty: (k: string, v: string) => void props.set(k, v) },
      classList: {
        add: (...names: string[]) => names.forEach((c) => classes.add(c)),
        contains: (c: string) => classes.has(c),
      },
    },
    createElement: () => ({
      getContext: (type: string) =>
        env.webgl === false ||
        (env.webgl1Only && type === "webgl2") ||
        type === "experimental-webgl"
          ? null
          : { getExtension: () => ({ loseContext: () => void (state.lost = true) }) },
    }),
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
const saved = (mode: string) => ({ bc: JSON.stringify({ state: { mode }, version: 1 }) });
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
    ["without WebGL", { webgl: false }],
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

  it("releases the WebGL context it probed with", () => {
    expect(boot().state.lost).toBe(true);
  });
  it("marks WebGL support separately, and starts the town on a capable device", () => {
    const f = boot();
    expect(f.classes.has("has-webgl")).toBe(true);
    expect(f.classes.has("mode-story")).toBe(true);
  });

  it("keeps has-webgl but not the town when the visitor chose Lite", () => {
    const f = boot({ stored: { bc: JSON.stringify({ state: { qualityMode: "Lite" } }) } });
    expect(f.classes.has("has-webgl")).toBe(true);
    expect(f.classes.has("mode-text")).toBe(true);
  });

  it("no longer lets a saved manual quality outrank reduced motion or Save-Data: the mode rules decide", () => {
    const stored = { bc: JSON.stringify({ state: { qualityMode: "Low" } }) };
    expect(boot({ stored, reducedMotion: true }).classes.has("mode-text")).toBe(true);
    expect(boot({ stored, saveData: true }).classes.has("mode-text")).toBe(true);
  });

  it("treats a WebGL1-only device as having no WebGL, since the town needs WebGL2", () => {
    expect([...boot({ webgl1Only: true }).classes]).toEqual(["mode-text"]);
  });

  it("keeps has-webgl but skips the town after a failed boot this session", () => {
    const f = boot({ townFailed: true });
    expect(f.classes.has("has-webgl")).toBe(true);
    expect(f.classes.has("mode-text")).toBe(true);
  });

  it("adds nothing without WebGL", () => {
    expect([...boot({ webgl: false }).classes]).toEqual(["mode-text"]);
  });
});

describe("mode before first paint", () => {
  it("starts in Story by default", () => expect(modes(boot().classes)).toEqual(["mode-story"]));
  it("starts in Text without WebGL2, with reduced motion, with Save-Data or after a failed town", () => {
    for (const env of [
      { webgl: false },
      { reducedMotion: true },
      { saveData: true },
      { townFailed: true },
    ])
      expect(modes(boot(env).classes)).toEqual(["mode-text"]);
  });
  it("restores a saved mode", () => {
    expect(modes(boot({ stored: saved("explore") }).classes)).toEqual(["mode-explore"]);
    expect(modes(boot({ stored: saved("text") }).classes)).toEqual(["mode-text"]);
  });
  it("keeps a saved Story without WebGL2: the story works on the still image", () => {
    expect(modes(boot({ webgl: false, stored: saved("story") }).classes)).toEqual(["mode-story"]);
  });
  it("turns a saved Explore into Text when WebGL2 is gone", () => {
    expect(modes(boot({ webgl: false, stored: saved("explore") }).classes)).toEqual(["mode-text"]);
  });
  it("lets #text win over a saved mode", () => {
    expect(modes(boot({ hash: "#text", stored: saved("explore") }).classes)).toEqual(["mode-text"]);
  });
  it("opens Explore for an explore-only place, and Text for one without WebGL2", () => {
    expect(modes(boot({ hash: "#Stadium" }).classes)).toEqual(["mode-explore"]);
    expect(modes(boot({ hash: "#stadium", webgl: false }).classes)).toEqual(["mode-text"]);
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
