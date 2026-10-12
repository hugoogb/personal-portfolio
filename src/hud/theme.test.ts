import { describe, expect, it } from "vitest";
import { hudTheme } from "@/hud/theme";

describe("hudTheme", () => {
  it("follows the night in auto mode", () => {
    expect(hudTheme("auto", 0.2)).toBe("light");
    expect(hudTheme("auto", 0.8)).toBe("dark");
  });

  it("respects a pinned theme", () => {
    expect(hudTheme("light", 1)).toBe("light");
    expect(hudTheme("dark", 0)).toBe("dark");
  });
});
