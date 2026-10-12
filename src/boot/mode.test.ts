import { describe, expect, it } from "vitest";
import { MODES, applyModeClass, isMode, readModeClass } from "@/boot/mode";

const root = () => {
  const classes = new Set<string>();
  return {
    classList: {
      add: (c: string) => void classes.add(c),
      remove: (...c: string[]) => c.forEach((x) => classes.delete(x)),
      contains: (c: string) => classes.has(c),
    },
    classes,
  };
};

describe("mode", () => {
  it("knows the three modes", () => {
    expect(MODES).toEqual(["story", "explore", "text"]);
    expect(isMode("explore")).toBe(true);
    expect(isMode("brief")).toBe(false);
  });

  it("keeps exactly one mode class on the root", () => {
    const r = root();
    applyModeClass("story", r as unknown as HTMLElement);
    applyModeClass("explore", r as unknown as HTMLElement);
    expect([...r.classes]).toEqual(["mode-explore"]);
    expect(readModeClass(r as unknown as HTMLElement)).toBe("explore");
  });

  it("reads text when no mode class is set", () => {
    expect(readModeClass(root() as unknown as HTMLElement)).toBe("text");
  });
});
