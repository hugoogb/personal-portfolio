import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { onMotionPreferenceChange, prefersReducedMotion } from "@/utils/motion";
import { useBaseCamp } from "@/store/store";
import type { BuiltWorld } from "@/world/build";
import { planRoutes, pointAt } from "@/world/traffic/model";
import { ambientOn, trafficCaps } from "@/world/lib/ambient";
import { TrafficSim, type Packet } from "@/world/traffic/sim";

const RED = new THREE.Color("#ef4444");
const FLAT = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
const HIDDEN = new THREE.Matrix4().makeScale(0, 0, 0);

/** Moves the simulated packets (spec 6b). Packets appear once the build-in has finished. */
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
      at: { x: 0, z: 0, ry: 0 },
      ta: { x: 0, z: 0, ry: 0 },
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
    if (ambientOn(prefersReducedMotion())) t.chev.offset.x -= dt * 0.9;
    const { m, q, p, sc, up, c, at, ta } = tmp;
    // Parse the accent hex only when it changes, not for every ring every frame.
    if (tmp.accentHex !== s.accent) {
      tmp.accentHex = s.accent;
      tmp.accent.set(s.accent);
    }

    const write = (
      list: Packet[],
      mesh: THREE.InstancedMesh,
      trail: THREE.InstancedMesh,
      back: boolean,
    ) => {
      for (let k = 0; k < mesh.count; k++) {
        const pk = list[k];
        if (!pk) {
          mesh.setMatrixAt(k, HIDDEN);
          for (let j = 0; j < t.TRAIL; j++) trail.setMatrixAt(k * t.TRAIL + j, HIDDEN);
          continue;
        }
        const path = back ? reversed[pk.plan] : routes[pk.plan].path;
        pointAt(path, pk.s, at);
        q.setFromAxisAngle(up, at.ry);
        m.compose(
          p.set(at.x, 0.2 + Math.sin(pk.s * Math.PI * 2) * 0.015, at.z),
          q,
          sc.setScalar(1),
        );
        mesh.setMatrixAt(k, m);
        for (let j = 1; j <= t.TRAIL; j++) {
          const sj = pk.s - j * 0.17;
          pointAt(path, sj, ta);
          m.compose(p.set(ta.x, 0.2, ta.z), q, sc.setScalar(sj > 0 ? 1 - j * 0.22 : 0));
          trail.setMatrixAt(k * t.TRAIL + j - 1, m);
        }
      }
      mesh.instanceMatrix.needsUpdate = true;
      trail.instanceMatrix.needsUpdate = true;
    };
    write(sim.reqs, t.req, t.reqTrail, false);
    write(sim.ress, t.res, t.resTrail, true);

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
