import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { PlaceId } from "@/content/types";
import type { Tier } from "@/boot/tiers";
import { useBaseCamp } from "@/store/store";
import type { BuiltWorld } from "@/world/build";
import { lighting } from "@/world/lib/lighting";
import { windowFactor } from "@/world/lib/status";
import { barcelonaHour, effectiveHour, nightAmount } from "@/world/lib/sun";

const SHADOW_MAP: Record<Tier, number> = { 0: 0, 1: 0, 2: 1024, 3: 2048 };
const RECOMPUTE_S = 0.25;
export const SHADOW_EVERY = 2;

const hourNow = () => effectiveHour(useBaseCamp.getState().timeOverride, new Date());

const floodlightsOn = (world: BuiltWorld, on: boolean) => {
  for (const light of world.kit.pointLights) light.visible = on;
};

export function DayNight({ world }: { world: BuiltWorld }) {
  const scene = useThree((s) => s.scene);
  const gl = useThree((s) => s.gl);
  const frame = useRef(0);
  const tier = useBaseCamp((s) => s.tier);
  const size = SHADOW_MAP[tier];
  const hemi = useRef<THREE.HemisphereLight>(null);
  const sun = useRef<THREE.DirectionalLight>(null);
  const target = useMemo(() => new THREE.Object3D(), []);
  const bg = useMemo(() => new THREE.Color(), []);
  const since = useRef(RECOMPUTE_S);

  useEffect(() => {
    scene.background = bg;
    since.current = RECOMPUTE_S;
  }, [scene, bg, size]);

  useLayoutEffect(() => {
    gl.shadowMap.autoUpdate = false;
    gl.shadowMap.needsUpdate = true;
    return () => {
      gl.shadowMap.autoUpdate = true;
    };
  }, [gl, size]);

  useLayoutEffect(() => floodlightsOn(world, lighting(hourNow()).stadium > 0), [world]);

  useFrame((_, dt) => {
    if (++frame.current % SHADOW_EVERY === 0) gl.shadowMap.needsUpdate = true;
    since.current += dt;
    if (since.current < RECOMPUTE_S) return;
    since.current = 0;
    const s = useBaseCamp.getState();
    const L = lighting(hourNow());
    const { kit, town, env } = world;
    env.night = L.night;
    env.lit = L.lit;
    env.tier = s.tier;
    target.position.set(s.view.x, 0, s.view.z);
    target.updateMatrixWorld();
    if (sun.current) {
      sun.current.position.set(
        s.view.x + L.sun.offset[0],
        L.sun.offset[1],
        s.view.z + L.sun.offset[2],
      );
      sun.current.color.set(L.sun.color);
      sun.current.intensity = L.sun.intensity;
    }
    if (hemi.current) {
      hemi.current.color.set(L.hemi.sky);
      hemi.current.groundColor.set(L.hemi.ground);
      hemi.current.intensity = L.hemi.intensity;
    }
    bg.set(L.background);
    town.water.color.set(L.water);
    town.water.roughness = 0.18 + (0.6 - 0.18) * L.night;
    kit.materials.win.emissiveIntensity = L.windows.bright;
    kit.materials.winDim.emissiveIntensity = L.windows.dim;
    for (const [id, set] of Object.entries(world.placeWindows) as [
      PlaceId,
      NonNullable<BuiltWorld["placeWindows"][PlaceId]>,
    ][]) {
      const f = windowFactor(s.status, id);
      set.win.emissiveIntensity = L.windows.bright * f;
      set.winDim.emissiveIntensity = L.windows.dim * f;
      for (const g of set.glows) g.material.emissiveIntensity = g.base * f;
    }
    if (s.introDone && nightAmount(barcelonaHour(new Date())) > 0.6) s.achieve("night");
    const flows = kit.life.flowMat as THREE.MeshBasicMaterial | undefined;
    if (flows) flows.opacity = Math.min(1, L.packets);
    kit.materials.lamp.emissiveIntensity = L.lamps;
    for (const m of kit.signMats) m.emissiveIntensity = L.signs;
    for (const light of kit.pointLights) light.intensity = L.stadium;
    if (kit.pointLights[0] && kit.pointLights[0].visible !== L.stadium > 0) {
      floodlightsOn(world, L.stadium > 0);
    }
    kit.materials.pool.opacity = L.pools;
    kit.materials.pool.visible = L.pools > 0;
    const board = kit.life.boardFace as THREE.MeshStandardMaterial | undefined;
    if (board) board.emissiveIntensity = L.board;
  });

  return (
    <>
      <hemisphereLight ref={hemi} args={["#cfe6ff", "#5b7a4a", 1.2]} />
      <primitive object={target} />
      <directionalLight
        key={size}
        ref={sun}
        target={target}
        intensity={2.6}
        castShadow={size > 0}
        shadow-mapSize={[size || 512, size || 512]}
        shadow-camera-left={-31}
        shadow-camera-right={31}
        shadow-camera-top={31}
        shadow-camera-bottom={-31}
        shadow-camera-near={1}
        shadow-camera-far={90}
        shadow-bias={-0.0005}
        shadow-normalBias={0.03}
      />
    </>
  );
}
