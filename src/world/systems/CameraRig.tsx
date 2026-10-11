import { prefersReducedMotion } from "@/utils/motion";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { PLACE_BY_ID } from "@/content/places";
import { STOPS, cameraOffset, poseAt, poseFor } from "@/content/tour";
import { useBaseCamp } from "@/store/store";
import { currentStop, progress } from "@/story/progress";
import {
  NARROW_WIDTH,
  clampTarget,
  clampView,
  STORY_VIEW_MAX,
  damp,
  frameFor,
  panDelta,
  rigState,
  wheelZoom,
  zoomFor,
} from "@/world/lib/camera";
import { drag } from "@/world/lib/drag";

const EASE = 6;
const PUBLISH_EVERY_S = 0.1;
/** How long the town dims on a reduced-motion cut between stops. */
const CUT_FADE_MS = 180;

/**
 * Fixed isometric orthographic camera (spec 4.1): eases to the selection or to
 * a HUD goal, pans by drag (the ground follows the pointer), zooms by wheel or
 * pinch, and publishes where it is for the minimap a few times a second.
 * In Story the scroll drives it instead (story spec 4.2): the goal is the tour's
 * pose, with an azimuth swing that eases back to 0 in Explore.
 */
export function CameraRig() {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const gl = useThree((s) => s.gl);
  const start = frameFor(PLACE_BY_ID.hq.map, false);
  const rig = useRef({
    x: start.x,
    z: start.z,
    view: start.view,
    gx: start.x,
    gz: start.z,
    gview: start.view,
    az: 0,
    gaz: 0,
    since: 0,
    cut: progress.cut,
  });
  const narrow = useRef(size.width < NARROW_WIDTH);
  narrow.current = size.width < NARROW_WIDTH;
  const aspect = useRef(size.width / size.height);
  aspect.current = size.width / size.height;

  useEffect(() => {
    const aim = (x: number, z: number, view: number) => {
      const t = clampTarget(x, z);
      Object.assign(rig.current, { gx: t.x, gz: t.z, gview: clampView(view) });
    };
    const frame = (id: keyof typeof PLACE_BY_ID) => {
      const f = frameFor(PLACE_BY_ID[id].map, narrow.current);
      aim(f.x, f.z, f.view);
    };
    const jump = (x: number, z: number, view: number, az = 0) => {
      const t = clampTarget(x, z);
      const v = clampView(view);
      Object.assign(rig.current, {
        x: t.x,
        z: t.z,
        view: v,
        gx: t.x,
        gz: t.z,
        gview: v,
        az,
        gaz: az,
      });
    };
    const s0 = useBaseCamp.getState();
    if (s0.introRunning && s0.goal) jump(s0.goal.x, s0.goal.z, s0.goal.view);
    else if (s0.mode === "story" && !s0.firstVisit) {
      // A return visit has no build-in: ease in from the wide shot (story spec 4.1).
      const p = poseFor(STOPS[STOPS.length - 1], narrow.current, aspect.current);
      jump(p.x, p.z, p.view, p.az);
    } else if (s0.selected && s0.mode !== "story") frame(s0.selected);
    return useBaseCamp.subscribe((s, prev) => {
      // In Story the scroll drives the camera: a selection or a reframe does not move it.
      const story = s.mode === "story";
      if (!story && !s.introRunning && s.selected && s.selected !== prev.selected)
        frame(s.selected);
      if (s.goal && s.goal !== prev.goal) {
        if (s.goal.instant) jump(s.goal.x, s.goal.z, s.goal.view);
        else aim(s.goal.x, s.goal.z, s.goal.view);
      }
      if (!story && s.reframeSeq !== prev.reframeSeq && s.selected) frame(s.selected);
    });
  }, []);

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
      const s = useBaseCamp.getState();
      // Story: the page owns the pointer. Driving: the drag steers the car, it does not pan.
      if (s.mode !== "explore" || s.driving) return;
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
    };
    const onUp = (e: PointerEvent) => {
      pointers.delete(e.pointerId);
      pinch = 0;
    };
    const onWheel = (e: WheelEvent) => {
      // Outside Explore the wheel scrolls the page.
      if (useBaseCamp.getState().mode !== "explore") return;
      e.preventDefault();
      // wheelZoom expects pixels: Firefox reports lines (1) or pages (2) on some devices.
      const px = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? el.clientHeight : 1;
      rig.current.gview = wheelZoom(rig.current.gview, e.deltaY * px);
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
  }, [gl]);

  useFrame((_, delta) => {
    const dt = Math.max(0, delta);
    const r = rig.current;
    const reduced = prefersReducedMotion();
    const s = useBaseCamp.getState();
    if (s.mode === "story" && !s.introRunning) {
      const p = reduced
        ? poseAt(currentStop(progress), 0, narrow.current, aspect.current)
        : poseAt(progress.index, progress.fraction, narrow.current, aspect.current);
      // Unclamped: a pose framing a building by the shore sits past the pan limit on purpose.
      Object.assign(r, { gx: p.x, gz: p.z, gview: clampView(p.view, STORY_VIEW_MAX), gaz: p.az });
    } else if (s.mode === "explore") {
      // Back inside the pan limit, at the fixed isometric angle.
      const t = clampTarget(r.gx, r.gz);
      Object.assign(r, { gx: t.x, gz: t.z, gaz: 0 });
    }
    if (r.cut !== progress.cut) {
      // A reduced-motion cut between stops: a short dip of the town, not a camera move.
      r.cut = progress.cut;
      const root = document.getElementById("town-root");
      root?.classList.add("town-cut");
      window.setTimeout(() => root?.classList.remove("town-cut"), CUT_FADE_MS);
    }
    const lambda = reduced ? Infinity : EASE;
    r.x = damp(r.x, r.gx, lambda, dt);
    r.z = damp(r.z, r.gz, lambda, dt);
    r.view = damp(r.view, r.gview, lambda, dt);
    r.az = damp(r.az, r.gaz, lambda, dt);
    const o = cameraOffset(r.az);
    camera.position.set(r.x + o[0], o[1], r.z + o[2]);
    camera.lookAt(r.x, 0, r.z);
    Object.assign(rigState, { x: r.x, z: r.z, view: r.view, az: r.az });
    const zoom = zoomFor(r.view, size.height);
    if (Math.abs(camera.zoom - zoom) > 1e-4) {
      camera.zoom = zoom;
      camera.updateProjectionMatrix();
    }
    r.since += dt;
    if (r.since >= PUBLISH_EVERY_S) {
      r.since = 0;
      // Only a change is published: each one re-renders the minimap.
      const v = s.view;
      const a = aspect.current;
      if (
        Math.abs(v.x - r.x) + Math.abs(v.z - r.z) + Math.abs(v.view - r.view) > 1e-3 ||
        v.aspect !== a
      )
        s.setView({ x: r.x, z: r.z, view: r.view, aspect: a });
    }
  });

  return null;
}
