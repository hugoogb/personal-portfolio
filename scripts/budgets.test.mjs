import { describe, expect, it } from "vitest";
import { BUDGETS, KB, budgetSets, closure, overBudget } from "./budgets.mjs";

const report = {
  chunks: {
    "assets/index.js": {
      name: "index",
      isEntry: true,
      imports: ["assets/react.js", "assets/vercel.js"],
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

  it("splits initial, world and effects without double counting", () => {
    const sets = budgetSets(report);
    expect([...sets.initial].sort()).toEqual(
      [
        "assets/Hud.js",
        "assets/index.js",
        "assets/react.js",
        "assets/sun.js",
        "assets/vercel.js",
      ].sort(),
    );
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
    expect(BUDGETS).toEqual({ initial: 100 * KB, world: 350 * KB, effects: 105 * KB });
    expect(overBudget({ initial: 99 * KB, world: 351 * KB, effects: 105 * KB })).toEqual(["world"]);
  });
});
