import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { isPreview } from "@/hud/commands";
import type { BuiltWorld } from "@/world/build";

declare global {
  interface Window {
    __baseCamp?: {
      screenOf(t: string): { x: number; y: number } | null;
      /** The last frame's renderer counters, for perf checks. */
      info(): {
        frame: number;
        calls: number;
        triangles: number;
        geometries: number;
        textures: number;
      };
    };
  }
}

/** Preview-only: where an egg is on the page (so e2e can click it) and renderer counters. Does nothing on the live host. */
export function TestHooks({ world }: { world: BuiltWorld }) {
  const camera = useThree((s) => s.camera);
  const gl = useThree((s) => s.gl);
  // Frames drawn: gl.info.render.frame counts every render() call, several a frame under the composer.
  const frames = useRef(0);
  useFrame(() => {
    frames.current++;
  });
  const canvas = gl.domElement;
  useEffect(() => {
    if (!isPreview()) return;
    const v = new THREE.Vector3();
    const screenOf = (target: string) => {
      const life = world.kit.life;
      let obj: THREE.Object3D | undefined;
      if (target === "hat") obj = life.hat as THREE.Object3D | undefined;
      else {
        const i = Number(/^car(\d)$/.exec(target)?.[1]);
        obj = (life.f1 as { cars: { g: THREE.Object3D }[] } | undefined)?.cars[i]?.g;
      }
      if (!obj) return null;
      camera.updateMatrixWorld();
      obj.getWorldPosition(v).project(camera);
      if (Math.abs(v.x) > 1 || Math.abs(v.y) > 1) return null;
      const r = canvas.getBoundingClientRect();
      return { x: ((v.x + 1) / 2) * r.width + r.left, y: ((1 - v.y) / 2) * r.height + r.top };
    };
    const info = () => ({
      frame: frames.current,
      calls: gl.info.render.calls,
      triangles: gl.info.render.triangles,
      geometries: gl.info.memory.geometries,
      textures: gl.info.memory.textures,
    });
    window.__baseCamp = { screenOf, info };
    return () => {
      delete window.__baseCamp;
    };
  }, [world, camera, canvas, gl]);
  return null;
}
