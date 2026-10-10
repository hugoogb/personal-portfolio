import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { onMotionPreferenceChange, prefersReducedMotion } from "@/utils/motion";
import { useBaseCamp } from "@/store/store";
import type { BuiltWorld } from "@/world/build";
import { PIECES, STREAK } from "@/world/traffic/build";
import { planRoutes, streakPoints } from "@/world/traffic/model";
import { trafficCaps } from "@/world/lib/ambient";
import { TrafficSim, type Packet } from "@/world/traffic/sim";

const RED = new THREE.Color("#ef4444");
const FLAT = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
const HIDDEN = new THREE.Matrix4().makeScale(0, 0, 0);

/** Moves the simulated flows (spec 6b). They appear once the build-in has finished. */
export function Traffic({ world }: { world: BuiltWorld }) {
  const routes = world.traffic.routes;
  /** Responses travel the same roads back, so they use each route reversed. */
  const reversed = useMemo(() => routes.map((r) => [...r.path].reverse()), [routes]);
  const sim = useMemo(() => {
    const s = useBaseCamp.getState();
    return new TrafficSim(
      planRoutes(routes, s.status),
      trafficCaps(s.tier, prefersReducedMotion()),
    );
  }, [routes]);
  const tmp = useMemo(
    () => ({
      m: new THREE.Matrix4(),
      q: new THREE.Quaternion(),
      p: new THREE.Vector3(),
      sc: new THREE.Vector3(),
      up: new THREE.Vector3(0, 1, 0),
      c: new THREE.Color(),
      pts: Array.from({ length: PIECES + 1 }, () => ({ x: 0, z: 0, ry: 0, u: 0 })),
      accent: new THREE.Color(),
      accentHex: "",
    }),
    [],
  );

  useEffect(() => {
    // The sim was built before this subscription: catch up with any change in between.
    const now = useBaseCamp.getState();
    sim.setPlans(planRoutes(routes, now.status));
    sim.setCaps(trafficCaps(now.tier, prefersReducedMotion()));
    const unsub = useBaseCamp.subscribe((s, prev) => {
      if (s.status !== prev.status) sim.setPlans(planRoutes(routes, s.status));
      if (s.tier !== prev.tier) sim.setCaps(trafficCaps(s.tier, prefersReducedMotion()));
    });
    // The preference can flip mid-visit: empty the roads (or refill them) at once.
    const onPref = () =>
      sim.setCaps(trafficCaps(useBaseCamp.getState().tier, prefersReducedMotion()));
    const offPref = onMotionPreferenceChange(onPref);
    return () => {
      unsub();
      offPref();
    };
  }, [routes, sim]);

  useFrame((_, delta) => {
    const t = world.traffic;
    const s = useBaseCamp.getState();
    t.group.visible = s.introDone;
    if (!s.introDone) return;
    const dt = Math.min(0.05, Math.max(0, delta));
    sim.step(dt);
    const { m, q, p, sc, up, c, pts } = tmp;
    // Parse the accent hex only when it changes, not for every ring every frame.
    if (tmp.accentHex !== s.accent) {
      tmp.accentHex = s.accent;
      tmp.accent.set(s.accent);
    }

    // Requests and responses draw the same streak: the town shows flow, not direction.
    const range = t.flows.geometry.getAttribute("flowRange") as THREE.InstancedBufferAttribute;
    let k = 0;
    const write = (list: Packet[], back: boolean) => {
      for (let i = 0; i < list.length; i++) {
        const pk = list[i];
        const path = back ? reversed[pk.plan] : routes[pk.plan].path;
        const n = streakPoints(path, Math.max(0, pk.s - STREAK), pk.s, pts);
        for (let j = 1; j < n && k < t.flows.count; j++, k++) {
          const a = pts[j - 1];
          const b = pts[j];
          const dx = b.x - a.x;
          const dz = b.z - a.z;
          q.setFromAxisAngle(up, Math.atan2(-dz, dx));
          m.compose(p.set(b.x, 0.09, b.z), q, sc.set(Math.hypot(dx, dz), 1, 1));
          t.flows.setMatrixAt(k, m);
          range.setXY(k, a.u, b.u);
        }
      }
    };
    write(sim.reqs, false);
    write(sim.ress, true);
    for (; k < t.flows.count; k++) t.flows.setMatrixAt(k, HIDDEN);
    t.flows.instanceMatrix.needsUpdate = true;
    range.needsUpdate = true;

    for (let k = 0; k < t.rings.count; k++) {
      const pu = sim.pulses[k];
      if (!pu) {
        t.rings.setMatrixAt(k, HIDDEN);
        continue;
      }
      const grow = 1 + (1 - pu.life) * 2.6;
      m.compose(p.set(pu.x, 0.1, pu.z), FLAT, sc.setScalar(grow));
      t.rings.setMatrixAt(k, m);
      t.rings.setColorAt(
        k,
        (pu.down ? c.copy(RED) : c.copy(tmp.accent)).multiplyScalar(pu.life * 0.85),
      );
    }
    t.rings.instanceMatrix.needsUpdate = true;
    if (t.rings.instanceColor) t.rings.instanceColor.needsUpdate = true;
  });

  return null;
}
