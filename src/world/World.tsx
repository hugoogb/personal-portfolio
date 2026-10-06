import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Tier } from "@/boot/tiers";
import { useBaseCamp } from "@/store/store";
import { buildWorld } from "@/world/build";
import { CAMERA_OFFSET } from "@/world/lib/camera";
import { wasDrag } from "@/world/lib/drag";
import { Places } from "@/world/scene/Places";
import { CameraRig } from "@/world/systems/CameraRig";
import { DayNight } from "@/world/systems/DayNight";
import { Governor } from "@/world/systems/Governor";
import { Labels } from "@/world/systems/Labels";
import { Life } from "@/world/systems/Life";

const MAX_DPR: Record<Tier, number> = { 0: 1, 1: 1, 2: 1.5, 3: 2 };

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

export interface WorldProps {
  onReady: () => void;
}

/** The town's canvas (spec 9.2). Rendering pauses while the tab is hidden or the Brief covers it. */
export default function World({ onReady }: WorldProps) {
  const tier = useBaseCamp((s) => s.tier);
  const briefOpen = useBaseCamp((s) => s.briefOpen);
  const world = useMemo(() => buildWorld(), []);
  useEffect(() => () => world.kit.dispose(), [world]);
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
      <DayNight world={world} />
      <primitive object={world.town.root} />
      <Places places={world.places} />
      <CameraRig />
      <Governor />
      <Labels />
      <Life world={world} />
      {frameloop === "demand" && <ThirtyFps />}
      <FirstFrame onDrawn={() => setDrawn(true)} onReady={onReady} />
    </Canvas>
  );
}
