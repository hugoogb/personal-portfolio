import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { IDLE_FPS, TARGET_FPS } from "@/boot/tiers";
import { useIdle } from "@/hooks/useIdle";
import { isPreview } from "@/hud/commands";
import { useBaseCamp } from "@/store/store";
import { buildWorldInSlices, type BuiltWorld } from "@/world/build";
import { canRenderHalfFloat, effectsEnabled, probeHalfFloat } from "@/world/effects/effectsGate";
import { FloatTargets } from "@/world/effects/FloatTargets";
import { EffectsBoundary } from "@/world/effects/EffectsBoundary";
import { CAMERA_OFFSET } from "@/world/lib/camera";
import { wasDrag } from "@/world/lib/drag";
import { skipUnlitPointLights } from "@/world/lib/pointLights";
import { Places } from "@/world/scene/Places";
import { Arrivals } from "@/world/systems/Arrivals";
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

skipUnlitPointLights();

const usePageHidden = () => {
  const [hidden, setHidden] = useState(() => document.hidden);
  useEffect(() => {
    const onChange = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onChange);
    return () => document.removeEventListener("visibilitychange", onChange);
  }, []);
  return hidden;
};

function Compile({ offscreen, onDone }: { offscreen: boolean; onDone: () => void }) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  useEffect(() => {
    let live = true;
    const target = offscreen && canRenderHalfFloat(gl) ? new THREE.WebGLRenderTarget(1, 1) : null;
    const previous = gl.getRenderTarget();
    gl.setRenderTarget(target);
    const compiling = gl.compileAsync(scene, camera);
    gl.setRenderTarget(previous);
    compiling
      .catch(() => undefined)
      .then(() => {
        target?.dispose();
        if (live) onDone();
      });
    return () => {
      live = false;
    };
  }, [gl, scene, camera, offscreen, onDone]);
  return null;
}

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

export default function World({ onReady }: WorldProps) {
  const tier = useBaseCamp((s) => s.tier);
  const dpr = useBaseCamp((s) => s.dpr);
  const idle = useBaseCamp((s) => s.idle);
  useIdle();
  const [world, setWorld] = useState<BuiltWorld | null>(null);
  const [failure, setFailure] = useState<unknown>(null);
  if (failure) throw failure;
  useEffect(() => {
    const abort = new AbortController();
    let built: BuiltWorld | null = null;
    buildWorldInSlices(abort.signal).then(
      (w) => {
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
  const [compiled, setCompiled] = useState(false);
  const onCompiled = useCallback(() => setCompiled(true), []);
  const paused = drawn && hidden;

  const [composed] = useState(
    () => effectsEnabled(useBaseCamp.getState().tier) && probeHalfFloat(),
  );
  const composer = composed ? tier >= 2 : effectsEnabled(tier);

  return (
    <Canvas
      orthographic
      shadows={tier >= 2 && "percentage"}
      dpr={[1, dpr]}
      frameloop="never"
      camera={{ position: [...CAMERA_OFFSET], zoom: 30, near: 0.1, far: 300 }}
      gl={{ antialias: tier >= 2 && !composed, powerPreference: "high-performance" }}
      onCreated={({ gl, scene }) => {
        scene.matrixAutoUpdate = false;
        gl.debug.checkShaderErrors = isPreview();
      }}
      onPointerMissed={() => {
        if (!wasDrag() && !useBaseCamp.getState().driving) useBaseCamp.getState().deselect();
      }}
    >
      {!paused && compiled && (
        <Pacer fps={idle ? Math.min(IDLE_FPS, TARGET_FPS[tier]) : TARGET_FPS[tier]} />
      )}
      <CameraRig />
      <Governor />
      <Labels />
      {world && (
        <>
          <BuildIn world={world} />
          <DayNight world={world} />
          <Arrivals world={world} />
          <primitive object={world.town.root} />
          <Compile offscreen={composer} onDone={onCompiled} />
          <Places places={world.places} />
          <Life world={world} />
          <Traffic world={world} />
          <ArenaDrive world={world} />
          <Eggs world={world} />
          {isPreview() && <TestHooks world={world} />}
          <YardLights world={world} />
          {compiled && <FirstFrame onDrawn={() => setDrawn(true)} onReady={onReady} />}
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
