import { describe, expect, it } from "vitest";
import { BUDGETS, KB, budgetSets, closure, overBudget } from "./budgets.mjs";

const report = {
  chunks: {
    "assets/index.js": {
      name: "index",
      isEntry: true,
      imports: ["assets/vercel.js"],
      dynamicImports: ["assets/TownApp.js", "assets/Hud.js", "assets/World.js"],
    },
    "assets/TownApp.js": {
      name: "TownApp",
      isEntry: false,
      imports: ["assets/index.js", "assets/react.js"],
      dynamicImports: ["assets/Hud.js", "assets/World.js"],
    },
    "assets/react.js": { name: "react-vendor", isEntry: false, imports: [], dynamicImports: [] },
    "assets/vercel.js": { name: "vercel-vendor", isEntry: false, imports: [], dynamicImports: [] },
    "assets/sun.js": { name: "sun", isEntry: false, imports: [], dynamicImports: [] },
    "assets/Hud.js": {
      name: "Hud",
      isEntry: false,
      imports: ["assets/index.js", "assets/react.js", "assets/sun.js"],
      dynamicImports: [],
    },
    "assets/World.js": {
      name: "World",
      isEntry: false,
      imports: ["assets/index.js", "assets/react.js", "assets/sun.js"],
      dynamicImports: ["assets/Effects.js"],
    },
    "assets/Effects.js": {
      name: "Effects",
      isEntry: false,
      imports: ["assets/World.js", "assets/pp.js"],
      dynamicImports: [],
    },
    "assets/pp.js": { name: "postprocessing", isEntry: false, imports: [], dynamicImports: [] },
  },
};

describe("budgets", () => {
  it("follows static imports only", () => {
    expect([...closure(report, ["assets/Hud.js"])].sort()).toEqual(
      [
        "assets/Hud.js",
        "assets/index.js",
        "assets/react.js",
        "assets/sun.js",
        "assets/vercel.js",
      ].sort(),
    );
  });

  it("splits initial, town, hud, world and effects without double counting", () => {
    const sets = budgetSets(report);
    expect([...sets.initial].sort()).toEqual(["assets/index.js", "assets/vercel.js"].sort());
    expect([...sets.town].sort()).toEqual(["assets/TownApp.js", "assets/react.js"].sort());
    expect([...sets.hud].sort()).toEqual(["assets/Hud.js", "assets/sun.js"]);
    expect([...sets.world]).toEqual(["assets/World.js"]);
    expect([...sets.effects].sort()).toEqual(["assets/Effects.js", "assets/pp.js"]);
  });

  it("fails loudly when a named chunk is missing", () => {
    const rest = Object.fromEntries(
      Object.entries(report.chunks).filter(([file]) => file !== "assets/Effects.js"),
    );
    expect(() => budgetSets({ chunks: rest })).toThrow(/Effects/);
  });

  it("names every set over its ceiling", () => {
    expect(BUDGETS).toEqual({
      initial: 20 * KB,
      town: 75 * KB,
      hud: 30 * KB,
      world: 350 * KB,
      effects: 105 * KB,
    });
    expect(
      overBudget({
        initial: 19 * KB,
        town: 76 * KB,
        hud: 31 * KB,
        world: 351 * KB,
        effects: 105 * KB,
      }),
    ).toEqual(["town", "hud", "world"]);
  });
});
