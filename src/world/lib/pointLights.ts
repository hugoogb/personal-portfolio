import { ShaderChunk } from "three";

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
