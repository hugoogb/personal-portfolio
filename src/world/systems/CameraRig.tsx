import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { PLACE_BY_ID } from "@/content/places";
import { useBaseCamp } from "@/store/store";
import {
  CAMERA_OFFSET,
  NARROW_WIDTH,
  clampTarget,
  clampView,
  damp,
  frameFor,
  panDelta,
  wheelZoom,
  zoomFor,
} from "@/world/lib/camera";
import { drag } from "@/world/lib/drag";

const EASE = 6;
const PUBLISH_EVERY_S = 0.1;

const reducedMotion = () =>
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Fixed isometric orthographic camera (spec 4.1): eases to the selection or to
 * a HUD goal, pans by drag (the ground follows the pointer), zooms by wheel or
 * pinch, and publishes where it is for the minimap a few times a second.
 */
export function CameraRig() {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const gl = useThree((s) => s.gl);
  const invalidate = useThree((s) => s.invalidate);
  const start = frameFor(PLACE_BY_ID.hq.map, false);
  const rig = useRef({
    x: start.x,
    z: start.z,
    view: start.view,
    gx: start.x,
    gz: start.z,
    gview: start.view,
    since: 0,
  });
  const narrow = useRef(size.width < NARROW_WIDTH);
  narrow.current = size.width < NARROW_WIDTH;
  const instant = useRef(reducedMotion());

  useEffect(() => {
    const aim = (x: number, z: number, view: number) => {
      const t = clampTarget(x, z);
      Object.assign(rig.current, { gx: t.x, gz: t.z, gview: clampView(view) });
      invalidate();
    };
    const frame = (id: keyof typeof PLACE_BY_ID) => {
      const f = frameFor(PLACE_BY_ID[id].map, narrow.current);
      aim(f.x, f.z, f.view);
    };
    const initial = useBaseCamp.getState().selected;
    if (initial) frame(initial);
    return useBaseCamp.subscribe((s, prev) => {
      if (s.selected && s.selected !== prev.selected) frame(s.selected);
      if (s.goal && s.goal !== prev.goal) aim(s.goal.x, s.goal.z, s.goal.view);
    });
  }, [invalidate]);

  useEffect(() => {
    const el = gl.domElement;
    el.style.touchAction = "none";
    const pointers = new Map<number, { x: number; y: number }>();
    let pinch = 0;
    const spread = () => {
      const [a, b] = [...pointers.values()];
      return Math.hypot(a.x - b.x, a.y - b.y);
    };
    const onDown = (e: PointerEvent) => {
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 1) drag.distance = 0;
      if (pointers.size === 2) pinch = spread();
    };
    const onMove = (e: PointerEvent) => {
      const last = pointers.get(e.pointerId);
      if (!last) return;
      const dx = e.clientX - last.x;
      const dy = e.clientY - last.y;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      drag.distance += Math.hypot(dx, dy);
      const r = rig.current;
      if (pointers.size === 1) {
        const d = panDelta(dx, dy, r.view, el.clientHeight);
        const t = clampTarget(r.gx - d.x, r.gz - d.z);
        // Move the camera and its goal together, so the ground stays under the pointer.
        r.x += t.x - r.gx;
        r.z += t.z - r.gz;
        r.gx = t.x;
        r.gz = t.z;
      } else if (pointers.size === 2) {
        const now = spread();
        if (pinch > 0 && now > 0) r.gview = clampView(r.gview * (pinch / now));
        pinch = now;
      }
      invalidate();
    };
    const onUp = (e: PointerEvent) => {
      pointers.delete(e.pointerId);
      pinch = 0;
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      // wheelZoom expects pixels: Firefox reports lines (1) or pages (2) on some devices.
      const px = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? el.clientHeight : 1;
      rig.current.gview = wheelZoom(rig.current.gview, e.deltaY * px);
      invalidate();
    };
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      el.removeEventListener("wheel", onWheel);
    };
  }, [gl, invalidate]);

  useFrame((_, delta) => {
    const dt = Math.max(0, delta);
    const r = rig.current;
    const lambda = instant.current ? Infinity : EASE;
    r.x = damp(r.x, r.gx, lambda, dt);
    r.z = damp(r.z, r.gz, lambda, dt);
    r.view = damp(r.view, r.gview, lambda, dt);
    camera.position.set(r.x + CAMERA_OFFSET[0], CAMERA_OFFSET[1], r.z + CAMERA_OFFSET[2]);
    camera.lookAt(r.x, 0, r.z);
    const zoom = zoomFor(r.view, size.height);
    if (Math.abs(camera.zoom - zoom) > 1e-4) {
      camera.zoom = zoom;
      camera.updateProjectionMatrix();
    }
    r.since += dt;
    if (r.since >= PUBLISH_EVERY_S) {
      r.since = 0;
      useBaseCamp
        .getState()
        .setView({ x: r.x, z: r.z, view: r.view, aspect: size.width / size.height });
    }
    if (Math.abs(r.x - r.gx) + Math.abs(r.z - r.gz) + Math.abs(r.view - r.gview) > 1e-3)
      invalidate();
  });

  return null;
}
