import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useBaseCamp } from "@/store/store";
import type { BuiltWorld } from "@/world/build";
import { createArena, stepArena, type ArenaState } from "@/world/lib/arena";

interface ArenaParts {
  g: THREE.Group;
  car: THREE.Object3D;
  ball: THREE.Object3D;
  flame: THREE.Object3D;
}

const FOCUS_EVERY_S = 0.1;
const NARROW_PX = 760;

const isField = (t: EventTarget | null) =>
  t instanceof HTMLElement &&
  (t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName));

/** Drive the arena car: keys or a held pointer steer, the camera follows, goals score. */
export function ArenaDrive({ world }: { world: BuiltWorld }) {
  const driving = useBaseCamp((s) => s.driving);
  const { gl, camera, raycaster } = useThree();
  const state = useRef<ArenaState>(createArena());
  const keys = useRef(new Set<string>());
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const since = useRef(0);
  const tmp = useMemo(
    () => ({
      ray: new THREE.Plane(new THREE.Vector3(0, 1, 0), 0),
      hit: new THREE.Vector3(),
      ndc: new THREE.Vector2(),
      v: new THREE.Vector3(),
    }),
    [],
  );
  const parts = () => world.kit.life.arena as ArenaParts | undefined;

  const writeMeshes = (boost: boolean, thr: number, dt: number) => {
    const p = parts();
    if (!p) return;
    const a = state.current;
    p.car.position.x = a.cp.x;
    p.car.position.z = a.cp.y;
    p.car.rotation.y = a.th;
    p.flame.visible = boost && thr > 0;
    p.flame.scale.y = 0.8 + Math.random() * 0.5;
    p.ball.position.x = a.ball.x;
    p.ball.position.z = a.ball.z;
    p.ball.visible = a.lock <= 0;
    p.ball.rotation.z -= (a.bv.x * dt) / 0.3;
    p.ball.rotation.x += (a.bv.y * dt) / 0.3;
  };

  // The world can unmount mid-drive (Settings to Lite): drive mode must not outlive it.
  useEffect(() => () => useBaseCamp.getState().setDriving(false), []);

  useEffect(() => {
    if (!driving) return;
    state.current = createArena();
    since.current = FOCUS_EVERY_S;
    const held = keys.current;
    const onKeyDown = (e: KeyboardEvent) => {
      // A Cmd/Ctrl chord swallows the keyup on macOS, which would leave the key held.
      if (isField(e.target) || e.metaKey || e.ctrlKey) return;
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (k === " " || k.startsWith("Arrow")) e.preventDefault();
      held.add(k);
    };
    const onKeyUp = (e: KeyboardEvent) => {
      held.delete(e.key.length === 1 ? e.key.toLowerCase() : e.key);
    };
    const el = gl.domElement;
    const aim = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      pointer.current = {
        x: ((e.clientX - r.left) / r.width) * 2 - 1,
        y: -(((e.clientY - r.top) / r.height) * 2 - 1),
      };
    };
    const onDown = (e: PointerEvent) => aim(e);
    const onMove = (e: PointerEvent) => {
      if (pointer.current) aim(e);
    };
    const onUp = () => {
      pointer.current = null;
    };
    const onBlur = () => held.clear();
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      held.clear();
      pointer.current = null;
      // Leaving drive mode: park the car and ball, then frame the arena again.
      state.current = createArena();
      writeMeshes(false, 0, 0);
      const s = useBaseCamp.getState();
      s.select("arena");
      s.reframe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driving, gl]);

  useFrame((_, rawDt) => {
    if (!useBaseCamp.getState().driving) return;
    const p = parts();
    if (!p) return;
    const dt = Math.min(0.05, rawDt);
    const k = keys.current;
    const up = k.has("w") || k.has("ArrowUp") ? 1 : 0;
    const down = k.has("s") || k.has("ArrowDown") ? 1 : 0;
    const left = k.has("a") || k.has("ArrowLeft") ? 1 : 0;
    const right = k.has("d") || k.has("ArrowRight") ? 1 : 0;
    const boost = k.has(" ");
    p.g.updateWorldMatrix(true, false);

    let steerTo: { x: number; z: number } | null = null;
    if (pointer.current) {
      tmp.ndc.set(pointer.current.x, pointer.current.y);
      raycaster.setFromCamera(tmp.ndc, camera);
      if (raycaster.ray.intersectPlane(tmp.ray, tmp.hit)) {
        p.g.worldToLocal(tmp.hit);
        steerTo = { x: tmp.hit.x, z: tmp.hit.z };
      }
    }
    const a = state.current;
    const thr = up - down;
    const { goal } = stepArena(a, { throttle: thr, steer: left - right, boost, steerTo }, dt);
    if (goal) {
      useBaseCamp.getState().addGoal(goal);
      const fans = world.kit.life.fans as { cheer: number } | undefined;
      if (fans) fans.cheer = 1.8;
    }
    // With a pointer held the throttle is the pointer's; the flame follows the keys only.
    writeMeshes(boost, thr, dt);

    since.current += dt;
    if (since.current >= FOCUS_EVERY_S) {
      since.current = 0;
      tmp.v.set(a.cp.x, 0, a.cp.y);
      p.g.localToWorld(tmp.v);
      const narrow = gl.domElement.clientWidth < NARROW_PX;
      useBaseCamp.getState().focus(tmp.v.x, tmp.v.z, narrow ? 9 : 8);
    }
  });
  return null;
}
