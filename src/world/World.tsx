import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import type { Tier } from "@/boot/tiers";
import { useBaseCamp } from "@/store/store";
import { CAMERA_OFFSET } from "@/world/lib/camera";
import { wasDrag } from "@/world/lib/drag";
import { PALETTE } from "@/world/lib/palette";
import { Ground } from "@/world/scene/Ground";
import { Homes } from "@/world/scene/Homes";
import { Places } from "@/world/scene/Places";
import { Roads } from "@/world/scene/Roads";
import { CameraRig } from "@/world/systems/CameraRig";
import { Governor } from "@/world/systems/Governor";
import { Labels } from "@/world/systems/Labels";

const MAX_DPR: Record<Tier, number> = { 0: 1, 1: 1, 2: 1.5, 3: 2 };
const SHADOW_MAP: Record<Tier, number> = { 0: 0, 1: 0, 2: 1024, 3: 2048 };

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

/** Low renders on demand at 30 fps (spec 8). */
function ThirtyFps() {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    const id = window.setInterval(() => invalidate(), 1000 / 30);
    return () => window.clearInterval(id);
  }, [invalidate]);
  return null;
}

/** Greybox daylight. Phase 3 replaces it with lighting() and the night. */
function Lights({ tier }: { tier: Tier }) {
  const size = SHADOW_MAP[tier];
  return (
    <>
      <hemisphereLight args={["#ffffff", "#8a9a7b", 1.1]} />
      <directionalLight
        position={[14, 22, 10]}
        intensity={2.2}
        castShadow={size > 0}
        shadow-mapSize={[size || 512, size || 512]}
        shadow-camera-left={-26}
        shadow-camera-right={26}
        shadow-camera-top={26}
        shadow-camera-bottom={-26}
        shadow-camera-far={80}
      />
    </>
  );
}

export interface WorldProps {
  onReady: () => void;
}

/** The town's canvas (spec 9.2). Rendering pauses while the tab is hidden or the Brief covers it. */
export default function World({ onReady }: WorldProps) {
  const tier = useBaseCamp((s) => s.tier);
  const briefOpen = useBaseCamp((s) => s.briefOpen);
  const hidden = usePageHidden();
  const [drawn, setDrawn] = useState(false);
  // The first frame is drawn whatever the Brief or the tab are doing, so boot can finish.
  const frameloop = !drawn
    ? "always"
    : hidden || briefOpen
      ? "never"
      : tier <= 1
        ? "demand"
        : "always";

  return (
    <Canvas
      orthographic
      shadows={tier >= 2}
      dpr={[1, MAX_DPR[tier]]}
      frameloop={frameloop}
      camera={{ position: [...CAMERA_OFFSET], zoom: 30, near: 0.1, far: 300 }}
      gl={{ antialias: tier >= 2, powerPreference: "high-performance" }}
      onPointerMissed={() => {
        if (!wasDrag()) useBaseCamp.getState().deselect();
      }}
    >
      <color attach="background" args={[PALETTE.sky]} />
      <Lights tier={tier} />
      <Ground />
      <Roads />
      <Homes />
      <Places />
      <CameraRig />
      <Governor />
      <Labels />
      {frameloop === "demand" && <ThirtyFps />}
      <FirstFrame onDrawn={() => setDrawn(true)} onReady={onReady} />
    </Canvas>
  );
}
