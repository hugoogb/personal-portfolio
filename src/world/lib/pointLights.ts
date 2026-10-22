import { ShaderChunk } from "three";

/**
 * three lights every pixel with every point light, then multiplies by an attenuation that is zero
 * beyond the light's distance. The stadium's four floodlights reach a few metres, yet the whole
 * town paid for them at night: a quarter of Medium's frame. This skips a point light's lighting
 * maths where it adds nothing (three already marks that light "not visible"), so the picture is
 * the same. Applied once, before any program compiles; a three that reshapes the chunk is left
 * as it is.
 */
export function skipUnlitPointLights() {
  const chunk = ShaderChunk.lights_fragment_begin;
  const start = chunk.indexOf("for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {");
  const end = chunk.indexOf("#pragma unroll_loop_end", start);
  if (start < 0 || end < 0) return;
  const loop = chunk.slice(start, end);
  if (loop.includes("if ( directLight.visible ) RE_Direct(")) return;
  ShaderChunk.lights_fragment_begin =
    chunk.slice(0, start) +
    loop.replace("RE_Direct( directLight,", "if ( directLight.visible ) RE_Direct( directLight,") +
    chunk.slice(end);
}
