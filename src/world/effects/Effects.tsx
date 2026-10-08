import { useFrame } from "@react-three/fiber";
import { Bloom, EffectComposer, N8AO, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode, type BloomEffect } from "postprocessing";
import { useRef, useState } from "react";
import { useBaseCamp } from "@/store/store";
import { bloomOn } from "@/world/effects/effectsGate";
import { lighting } from "@/world/lib/lighting";
import { effectiveHour } from "@/world/lib/sun";

const EVERY_S = 0.25;

/**
 * The High-only finish (spec 5.5): soft ambient occlusion all the time, and
 * bloom on the night lights. Loaded as its own chunk, so other tiers never
 * download it.
 */
export default function Effects() {
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
    <EffectComposer multisampling={4}>
      <N8AO halfRes quality="medium" aoRadius={1.2} distanceFalloff={0.4} intensity={2.2} />
      {night ? <Bloom ref={bloom} mipmapBlur luminanceThreshold={0.6} intensity={0} /> : <></>}
      {/* The composer turns the renderer's tone mapping off; this restores the Canvas's ACES, after bloom has seen the HDR values. */}
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  );
}
