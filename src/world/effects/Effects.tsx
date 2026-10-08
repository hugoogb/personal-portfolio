import { useFrame } from "@react-three/fiber";
import { Bloom, EffectComposer, FXAA, N8AO, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode, type BloomEffect } from "postprocessing";
import { useRef, useState } from "react";
import { useBaseCamp } from "@/store/store";
import { bloomOn } from "@/world/effects/effectsGate";
import { lighting } from "@/world/lib/lighting";
import { effectiveHour } from "@/world/lib/sun";

const EVERY_S = 0.25;

export interface EffectsProps {
  /** High: ambient occlusion and night bloom. Otherwise only tone mapping and FXAA. */
  full: boolean;
}

/**
 * The High finish (spec 5.5): soft ambient occlusion all the time, and bloom
 * on the night lights. Loaded as its own chunk, so other tiers never download
 * it. A canvas made for it has no MSAA: the composer antialiases with FXAA,
 * because N8AO over a multisampled target costs several times the scene
 * itself. When a High town steps down to Medium the composer stays, without
 * AO and bloom, so the scene's shaders do not all recompile.
 */
export default function Effects({ full }: EffectsProps) {
  const bloom = useRef<BloomEffect>(null);
  const strength = useRef(0);
  const since = useRef(EVERY_S);
  const [night, setNight] = useState(() =>
    bloomOn(lighting(effectiveHour(useBaseCamp.getState().timeOverride, new Date())).bloom),
  );

  useFrame((_, dt) => {
    since.current += dt;
    if (since.current >= EVERY_S) {
      since.current = 0;
      strength.current = lighting(
        effectiveHour(useBaseCamp.getState().timeOverride, new Date()),
      ).bloom;
      const on = bloomOn(strength.current);
      if (on !== night) setNight(on);
    }
    if (bloom.current) bloom.current.intensity = strength.current;
  });

  return (
    // No merging: FXAA reads its input texture directly at edges, so merged into the tone-mapping
    // pass it would return untone-mapped HDR there. On its own pass it reads the final colours.
    <EffectComposer multisampling={0} mergeMode="none">
      {full ? (
        // The sample counts barely move the cost (it is the full-screen passes); the
        // low ones keep the noise soft at this zoom.
        <N8AO
          halfRes
          aoSamples={8}
          denoiseSamples={4}
          denoiseRadius={12}
          aoRadius={1.2}
          distanceFalloff={0.4}
          intensity={2.2}
        />
      ) : (
        <></>
      )}
      {full && night ? (
        <Bloom ref={bloom} mipmapBlur luminanceThreshold={0.6} intensity={0} />
      ) : (
        <></>
      )}
      {/* The composer turns the renderer's tone mapping off; this restores the Canvas's ACES, after bloom has seen the HDR values. */}
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      {/* Last, on its own pass (see mergeMode). */}
      <FXAA />
    </EffectComposer>
  );
}
