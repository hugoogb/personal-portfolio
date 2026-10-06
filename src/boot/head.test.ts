import { describe, expect, it } from "vitest";
import { bootHead, headScript } from "@/boot/head";

interface Env {
  stored?: Record<string, string>;
  storageThrows?: boolean;
  webgl?: boolean;
  reducedMotion?: boolean;
  saveData?: boolean;
}

const fake = (env: Env = {}) => {
  const props = new Map<string, string>();
  const classes = new Set<string>();
  const state = { lost: false };
  const doc = {
    documentElement: {
      style: { setProperty: (k: string, v: string) => void props.set(k, v) },
      classList: { add: (c: string) => void classes.add(c) },
    },
    createElement: () => ({
      getContext: () =>
        env.webgl === false
          ? null
          : { getExtension: () => ({ loseContext: () => void (state.lost = true) }) },
    }),
  };
  const storage = { getItem: (k: string) => env.stored?.[k] ?? null };
  const win = {
    get localStorage() {
      if (env.storageThrows) throw new Error("SecurityError");
      return storage;
    },
    matchMedia: (q: string) => ({ matches: q.includes("reduce") && Boolean(env.reducedMotion) }),
    navigator: { connection: env.saveData ? { saveData: true } : undefined },
  };
  return { doc, win, props, classes, state };
};

const boot = (env: Env = {}) => {
  const f = fake(env);
  bootHead(f.doc as unknown as Document, f.win as unknown as Window);
  return f;
};

describe("bootHead", () => {
  it("paints a stored accent before first paint", () => {
    expect(boot({ stored: { color: "#10b981" } }).props.get("--primary-color")).toBe("#10b981");
  });

  it.each(["red", "javascript:alert(1)", "#fff", "url(x)"])("ignores a stored %s", (value) => {
    expect(boot({ stored: { color: value } }).props.has("--primary-color")).toBe(false);
  });

  it("marks a capable device", () => {
    expect(boot().classes.has("can-world")).toBe(true);
  });

  it.each([
    ["without WebGL", { webgl: false }],
    ["with reduced motion", { reducedMotion: true }],
    ["with Save-Data", { saveData: true }],
    [
      "when the visitor chose Lite",
      { stored: { bc: JSON.stringify({ state: { qualityMode: "Lite" }, version: 1 }) } },
    ],
  ])("does not mark a device %s", (_label, env) => {
    expect(boot(env).classes.has("can-world")).toBe(false);
  });

  it("survives a corrupt saved record and still paints the accent", () => {
    const f = boot({ stored: { color: "#10b981", bc: "{oops" } });
    expect(f.props.get("--primary-color")).toBe("#10b981");
    expect(f.classes.has("can-world")).toBe(true);
  });

  it("survives blocked storage", () => {
    const f = boot({ storageThrows: true });
    expect(f.props.size).toBe(0);
    expect(f.classes.has("can-world")).toBe(true);
  });

  it("releases the WebGL context it probed with", () => {
    expect(boot().state.lost).toBe(true);
  });
});

describe("headScript", () => {
  it("runs on its own, with no outside references", () => {
    const f = fake({ stored: { color: "#3142db" } });
    new Function("document", "window", headScript)(f.doc, f.win);
    expect(f.props.get("--primary-color")).toBe("#3142db");
    expect(f.classes.has("can-world")).toBe(true);
  });
});
