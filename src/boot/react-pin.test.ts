import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// pnpm-lock.yaml is not committed, so package.json alone decides what Vercel
// installs. React Three Fiber 9 supports React >=19 <19.4 (spec section 9.1),
// so a caret range would let a deploy pick up an unsupported React.
const pkg = JSON.parse(readFileSync(new URL("../../package.json", import.meta.url), "utf8"));

describe("React version", () => {
  it.each([
    ["dependencies", "react"],
    ["dependencies", "react-dom"],
    ["devDependencies", "@types/react"],
    ["devDependencies", "@types/react-dom"],
  ])("pins %s %s to an exact 19.3 release", (group, name) => {
    expect(pkg[group][name]).toMatch(/^19\.3\.\d+$/);
  });
});
