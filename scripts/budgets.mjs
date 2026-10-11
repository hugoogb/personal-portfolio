// Bundle budgets (spec 10). Sizes are gzipped bytes; 1 KB = 1024 bytes.
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const REPORT_PATH = path.join(ROOT, "node_modules/.cache/base-camp/bundle-report.json");
export const KB = 1024;
/**
 * initial: the entries' closure, all a phone loads before the story is readable (spec 8).
 * hud and world: the town, loaded when idle (Story) or at once (Explore). effects: High only.
 */
export const BUDGETS = { initial: 100 * KB, hud: 30 * KB, world: 350 * KB, effects: 105 * KB };

/** Every chunk reachable from `roots` through static imports. */
export const closure = (report, roots) => {
  const seen = new Set();
  const queue = [...roots];
  while (queue.length) {
    const file = queue.shift();
    if (seen.has(file)) continue;
    seen.add(file);
    queue.push(...(report.chunks[file]?.imports ?? []));
  }
  return seen;
};

const byName = (report, name) => {
  const file = Object.keys(report.chunks).find((f) => report.chunks[f].name === name);
  if (!file) throw new Error(`No chunk named ${name} in the bundle report`);
  return file;
};

const minus = (set, ...others) => new Set([...set].filter((f) => !others.some((o) => o.has(f))));

/** Splits the client build into the four budgeted sets, each chunk counted once. */
export const budgetSets = (report) => {
  const entries = Object.keys(report.chunks).filter((f) => report.chunks[f].isEntry);
  const initial = closure(report, entries);
  const hud = minus(closure(report, [byName(report, "Hud")]), initial);
  const world = minus(closure(report, [byName(report, "World")]), initial, hud);
  const effects = minus(closure(report, [byName(report, "Effects")]), initial, hud, world);
  return { initial, hud, world, effects };
};

export const overBudget = (sizes) => Object.keys(BUDGETS).filter((k) => sizes[k] > BUDGETS[k]);
