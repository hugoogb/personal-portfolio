import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useBaseCamp } from "@/store/store";
import type { BuiltWorld } from "@/world/build";
import { wasDrag } from "@/world/lib/drag";
import { FLASH_S, SAIL_S, WAVE_END, cheerLift, flashOn, waveLift } from "@/world/lib/eggs";

interface Ship {
  g: THREE.Object3D;
  home: THREE.Vector3;
  sail: number;
}
interface F1Car {
  g: THREE.Object3D;
  body: THREE.Mesh;
  mat: THREE.Material;
}
interface Stadium {
  crowd: THREE.InstancedMesh;
  seats: [number, number, number][];
  wave: number;
}
interface Fans {
  eggs: THREE.InstancedMesh;
  seats: [number, number, number][];
  cheer: number;
}

const CAR_HIT_R = 0.35;
const HAT_HIT_R = 0.45;

const cursor = (v: string) => {
  document.body.style.cursor = v;
};

/**
 * The easter eggs: the straw hat sails the caravel, the F1 cars flash purple on a
 * click, and the stadium wave and the fans' cheer move their instances. Each egg has
 * its own invisible hit target (three.js raycasts invisible meshes).
 */
export function Eggs({ world }: { world: BuiltWorld }) {
  const { kit } = world;
  const hat = kit.life.hat as THREE.Object3D | undefined;
  const ship = kit.life.ship as Ship | undefined;
  const f1 = kit.life.f1 as { cars: F1Car[] } | undefined;
  const stadium = kit.life.stadium as Stadium | undefined;
  const fans = kit.life.fans as Fans | undefined;

  const hatHit = useRef<THREE.Mesh>(null);
  const carHits = useRef<(THREE.Mesh | null)[]>([]);
  const hatPlaced = useRef(false);
  const flash = useRef(0);
  const clock = useRef(0);
  const flashMat = useMemo(() => kit.mat("#a855f7"), [kit]);
  const m4 = useMemo(() => new THREE.Matrix4(), []);
  const q = useMemo(() => new THREE.Quaternion(), []);
  const pos = useMemo(() => new THREE.Vector3(), []);
  const tall = useMemo(() => new THREE.Vector3(1, 1.35, 1), []);

  useEffect(() => {
    let last = useBaseCamp.getState().waveAt;
    return useBaseCamp.subscribe((s) => {
      if (s.waveAt === last) return;
      last = s.waveAt;
      if (stadium) stadium.wave = 0;
    });
  }, [stadium]);

  const writeCrowd = (wave: number) => {
    if (!stadium) return;
    for (let i = 0; i < stadium.seats.length; i++) {
      const s = stadium.seats[i];
      const lift = wave >= 0 ? waveLift(wave, s) * 0.22 : 0;
      m4.makeTranslation(s[0], s[1] + 0.12 + lift, s[2]);
      stadium.crowd.setMatrixAt(i, m4);
    }
    stadium.crowd.instanceMatrix.needsUpdate = true;
  };
  const writeFans = (cheer: number, t: number) => {
    if (!fans) return;
    for (let i = 0; i < fans.seats.length; i++) {
      const s = fans.seats[i];
      pos.set(s[0], s[1] + cheerLift(cheer, t, i), s[2]);
      m4.compose(pos, q, tall);
      fans.eggs.setMatrixAt(i, m4);
    }
    fans.eggs.instanceMatrix.needsUpdate = true;
  };

  useFrame((_, raw) => {
    const dt = Math.min(0.05, Math.max(0, raw));
    clock.current += dt;
    const t = clock.current;

    // The hat never moves: place its hit target once the build-in has settled the world.
    if (hat && hatHit.current && !hatPlaced.current && useBaseCamp.getState().introDone) {
      hat.updateWorldMatrix(true, false);
      hat.getWorldPosition(hatHit.current.position);
      hatPlaced.current = true;
    }
    if (f1) {
      for (let i = 0; i < f1.cars.length; i++) {
        const h = carHits.current[i];
        if (h) f1.cars[i].g.getWorldPosition(h.position);
      }
    }

    if (ship && ship.sail >= 0) {
      ship.sail += dt / SAIL_S;
      if (ship.sail >= 1) {
        ship.sail = -1;
        ship.g.position.x = ship.home.x;
        ship.g.position.z = ship.home.z;
      } else {
        const k = Math.sin(ship.sail * Math.PI);
        ship.g.position.x = ship.home.x + k * 9;
        ship.g.position.z = ship.home.z - k * 5;
      }
    }

    if (f1 && flash.current > 0) {
      flash.current -= dt;
      const on = flashOn(flash.current, t);
      for (const c of f1.cars) c.body.material = on ? flashMat : c.mat;
      if (flash.current <= 0) for (const c of f1.cars) c.body.material = c.mat;
    }

    if (stadium && stadium.wave >= 0) {
      stadium.wave += dt * 2.2;
      if (stadium.wave > WAVE_END) {
        stadium.wave = -1;
        writeCrowd(-1);
      } else {
        writeCrowd(stadium.wave);
      }
    }

    if (fans && fans.cheer > 0) {
      fans.cheer -= dt;
      if (fans.cheer > 0) {
        writeFans(fans.cheer, t);
      } else {
        fans.cheer = 0;
        for (let i = 0; i < fans.seats.length; i++) {
          const s = fans.seats[i];
          pos.set(s[0], s[1], s[2]);
          m4.compose(pos, q, tall);
          fans.eggs.setMatrixAt(i, m4);
        }
        fans.eggs.instanceMatrix.needsUpdate = true;
      }
    }
  });

  return (
    <group>
      {hat && (
        <mesh
          ref={hatHit}
          visible={false}
          userData={{ eggTarget: true }}
          onClick={(e) => {
            e.stopPropagation();
            if (wasDrag()) return;
            const s = useBaseCamp.getState();
            s.achieve("hat");
            if (ship && ship.sail < 0) ship.sail = 0;
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            cursor("pointer");
          }}
          onPointerOut={() => cursor("")}
        >
          <sphereGeometry args={[HAT_HIT_R, 8, 6]} />
        </mesh>
      )}
      {f1?.cars.map((_, i) => (
        <mesh
          key={i}
          ref={(m) => {
            carHits.current[i] = m;
          }}
          visible={false}
          userData={{ eggTarget: true }}
          onClick={(e) => {
            e.stopPropagation();
            if (wasDrag()) return;
            useBaseCamp.getState().achieve("lap");
            flash.current = FLASH_S;
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            cursor("pointer");
          }}
          onPointerOut={() => cursor("")}
        >
          <sphereGeometry args={[CAR_HIT_R, 8, 6]} />
        </mesh>
      ))}
    </group>
  );
}
