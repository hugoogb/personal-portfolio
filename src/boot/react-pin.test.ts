import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

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
