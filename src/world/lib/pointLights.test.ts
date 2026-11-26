import { ShaderChunk } from "three";
import { describe, expect, it } from "vitest";
import { skipUnlitPointLights } from "@/world/lib/pointLights";

const GUARD = "if ( directLight.visible ) RE_Direct( directLight,";
const count = (text: string, part: string) => text.split(part).length - 1;

describe("skipUnlitPointLights", () => {
  it("guards only the point lights' lighting, once", () => {
    const before = ShaderChunk.lights_fragment_begin;
    skipUnlitPointLights();
    skipUnlitPointLights();
    const after = ShaderChunk.lights_fragment_begin;
    expect(count(after, GUARD)).toBe(1);
    expect(count(after, "RE_Direct( directLight,")).toBe(count(before, "RE_Direct( directLight,"));
    const loop = after.slice(after.indexOf("i < NUM_POINT_LIGHTS"));
    expect(loop.indexOf(GUARD)).toBeLessThan(loop.indexOf("#pragma unroll_loop_end"));
  });
});
