import { Canvas, useFrame } from "@react-three/fiber";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { TARGET_FPS } from "@/boot/tiers";
import { useBaseCamp } from "@/store/store";
import { buildWorldInSlices, type BuiltWorld } from "@/world/build";
import { effectsEnabled, probeHalfFloat } from "@/world/effects/effectsGate";
import { FloatTargets } from "@/world/effects/FloatTargets";
import { EffectsBoundary } from "@/world/effects/EffectsBoundary";
import { CAMERA_OFFSET } from "@/world/lib/camera";
import { wasDrag } from "@/world/lib/drag";
import { Places } from "@/world/scene/Places";
import { ArenaDrive } from "@/world/systems/ArenaDrive";
import { BuildIn } from "@/world/systems/BuildIn";
import { CameraRig } from "@/world/systems/CameraRig";
import { DayNight } from "@/world/systems/DayNight";
import { Eggs } from "@/world/systems/Eggs";
import { Governor } from "@/world/systems/Governor";
import { Labels } from "@/world/systems/Labels";
import { Life } from "@/world/systems/Life";
import { Pacer } from "@/world/systems/Pacer";
import { TestHooks } from "@/world/systems/TestHooks";
import { Traffic } from "@/world/systems/Traffic";
import { YardLights } from "@/world/systems/YardLights";

const Effects = lazy(() => import("@/world/effects/Effects"));

const usePageHidden = () => {
  const [hidden, setHidden] = useState(() => document.hidden);
  useEffect(() => {
    const onChange = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onChange);
    return () => document.removeEventListener("visibilitychange", onChange);
  }, []);
  return hidden;
};

/** Calls onReady once, after the first frame has been drawn. */
function FirstFrame({ onDrawn, onReady }: { onDrawn: () => void; onReady: () => void }) {
  const done = useRef(false);
  useFrame(() => {
    if (done.current) return;
    done.current = true;
    onDrawn();
    requestAnimationFrame(() => onReady());
  });
  return null;
}

export interface WorldProps {
  onReady: () => void;
}

/**
 * The town's canvas (spec 9.2). The pacer draws it at the tier's frame rate and
 * stops while the tab is hidden or the Brief covers it.
 */
export default function World({ onReady }: WorldProps) {
  const tier = useBaseCamp((s) => s.tier);
  const dpr = useBaseCamp((s) => s.dpr);
  const briefOpen = useBaseCamp((s) => s.briefOpen);
  // Built in an effect so StrictMode's simulated unmount disposes a world that is then rebuilt,
  // and in slices, so the title card keeps moving meanwhile. A failed build reaches the boundary.
  const [world, setWorld] = useState<BuiltWorld | null>(null);
  const [failure, setFailure] = useState<unknown>(null);
  if (failure) throw failure;
  useEffect(() => {
    const abort = new AbortController();
    let built: BuiltWorld | null = null;
    buildWorldInSlices(abort.signal).then(
      (w) => {
        // Unmounted between the last slice and this callback: nobody else will dispose it.
        if (abort.signal.aborted) return w?.kit.dispose();
        built = w;
        if (w) setWorld(w);
      },
      (error: unknown) => setFailure(error ?? new Error("The town failed to build")),
    );
    return () => {
      abort.abort();
      setWorld(null);
      built?.kit.dispose();
    };
  }, []);
  const hidden = usePageHidden();
  const [drawn, setDrawn] = useState(false);
  // The first frame is drawn whatever the Brief or the tab are doing, so boot can finish.
  const paused = drawn && (hidden || briefOpen);

  // The context is made once. A town that starts on High draws through the composer, which
  // antialiases with FXAA, so its canvas has no MSAA. The composer then stays through Medium
  // (without AO and bloom): taking it away would recompile every shader in the scene at once.
  const [composed] = useState(
    () => effectsEnabled(useBaseCamp.getState().tier) && probeHalfFloat(),
  );
  const composer = composed ? tier >= 2 : effectsEnabled(tier);

  return (
    <Canvas
      orthographic
      shadows={tier >= 2}
      dpr={[1, dpr]}
      frameloop="never"
      camera={{ position: [...CAMERA_OFFSET], zoom: 30, near: 0.1, far: 300 }}
      gl={{ antialias: tier >= 2 && !composed, powerPreference: "high-performance" }}
      onPointerMissed={() => {
        if (!wasDrag() && !useBaseCamp.getState().driving) useBaseCamp.getState().deselect();
      }}
    >
      {!paused && <Pacer fps={TARGET_FPS[tier]} />}
      <CameraRig />
      <Governor />
      <Labels />
      {world && (
        <>
          <BuildIn world={world} />
          <DayNight world={world} />
          <primitive object={world.town.root} />
          <Places places={world.places} />
          <Life world={world} />
          <Traffic world={world} />
          <ArenaDrive world={world} />
          <Eggs world={world} />
          <TestHooks world={world} />
          <YardLights world={world} />
          <FirstFrame onDrawn={() => setDrawn(true)} onReady={onReady} />
        </>
      )}
      {world && composer && (
        <FloatTargets>
          <EffectsBoundary>
            <Suspense fallback={null}>
              <Effects full={effectsEnabled(tier)} />
            </Suspense>
          </EffectsBoundary>
        </FloatTargets>
      )}
    </Canvas>
  );
}
