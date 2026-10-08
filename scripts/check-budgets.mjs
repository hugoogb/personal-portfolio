import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";
import { BUDGETS, KB, REPORT_PATH, budgetSets, overBudget } from "./budgets.mjs";

const DIST = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../dist");
const report = JSON.parse(readFileSync(REPORT_PATH, "utf8"));
const gz = (file) => gzipSync(readFileSync(path.join(DIST, file)), { level: 9 }).length;

const sets = budgetSets(report);
const sizes = {};
for (const [name, files] of Object.entries(sets)) {
  sizes[name] = [...files].reduce((sum, f) => sum + gz(f), 0);
  const detail = [...files].map((f) => `${path.basename(f)} ${(gz(f) / KB).toFixed(1)}`).join(", ");
  console.log(
    `${name.padEnd(8)} ${(sizes[name] / KB).toFixed(1).padStart(6)} KB / ${BUDGETS[name] / KB} KB  (${detail})`,
  );
}
const over = overBudget(sizes);
if (over.length) {
  console.error(`Over budget: ${over.join(", ")}`);
  process.exit(1);
}
