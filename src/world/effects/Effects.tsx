import { useFrame } from "@react-three/fiber";
import { Bloom, EffectComposer, FXAA, N8AO, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode, type BloomEffect } from "postprocessing";
import { useRef, useState } from "react";
import { useBaseCamp } from "@/store/store";
import { bloomOn } from "@/world/effects/effectsGate";
import { lighting } from "@/world/lib/lighting";
import { effectiveHour } from "@/world/lib/sun";

const EVERY_S = 0.25;

interface AOPass {
  autoDetectTransparency: boolean;
  configuration: { transparencyAware: boolean };
}

const opaqueAO = (pass: AOPass | null) => {
  if (!pass) return;
  pass.autoDetectTransparency = false;
  pass.configuration.transparencyAware = false;
};

export interface EffectsProps {
  full: boolean;
}

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
    <EffectComposer multisampling={0} mergeMode="none">
      {full ? (
        <N8AO
          ref={opaqueAO}
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
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <FXAA />
    </EffectComposer>
  );
}
