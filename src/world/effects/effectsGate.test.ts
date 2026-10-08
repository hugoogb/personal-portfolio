import { describe, expect, it } from "vitest";
import {
  BLOOM_MIN,
  bloomOn,
  canRenderHalfFloat,
  effectsEnabled,
  probeHalfFloat,
} from "@/world/effects/effectsGate";
import { lighting } from "@/world/lib/lighting";

describe("effects (spec 5.5)", () => {
  it("run on High only", () => {
    expect([0, 1, 2, 3].map((t) => effectsEnabled(t as 0 | 1 | 2 | 3))).toEqual([
      false,
      false,
      false,
      true,
    ]);
  });

  it("bloom only above 0.04", () => {
    expect(BLOOM_MIN).toBe(0.04);
    expect(bloomOn(0)).toBe(false);
    expect(bloomOn(0.04)).toBe(false);
    expect(bloomOn(0.05)).toBe(true);
  });

  it("no bloom at noon, bloom at 23:00", () => {
    expect(bloomOn(lighting(13).bloom)).toBe(false);
    expect(bloomOn(lighting(23).bloom)).toBe(true);
    expect(lighting(23).bloom).toBeCloseTo(0.42 * lighting(23).lit, 9);
  });

  it("needs a context that can render to half-float targets", () => {
    const gl = (...names: string[]) => ({ extensions: { has: (n: string) => names.includes(n) } });
    expect(canRenderHalfFloat(gl("EXT_color_buffer_float"))).toBe(true);
    expect(canRenderHalfFloat(gl("EXT_color_buffer_half_float"))).toBe(true);
    expect(canRenderHalfFloat(gl())).toBe(false);
  });
});

describe("probeHalfFloat", () => {
  const docWith = (gl: unknown) =>
    ({ createElement: () => ({ getContext: () => gl }) }) as unknown as Document;
  const ctx = (names: string[]) => ({
    getExtension: (n: string) =>
      names.includes(n) || n === "WEBGL_lose_context" ? { loseContext: () => {} } : null,
  });

  it("says yes only for a WebGL2 context with float or half-float colour targets", () => {
    expect(probeHalfFloat(docWith(ctx(["EXT_color_buffer_float"])))).toBe(true);
    expect(probeHalfFloat(docWith(ctx(["EXT_color_buffer_half_float"])))).toBe(true);
    expect(probeHalfFloat(docWith(ctx([])))).toBe(false);
    expect(probeHalfFloat(docWith(null))).toBe(false);
  });

  it("says no when the probe throws", () => {
    const broken = {
      createElement: () => {
        throw new Error("blocked");
      },
    } as unknown as Document;
    expect(probeHalfFloat(broken)).toBe(false);
  });
});
