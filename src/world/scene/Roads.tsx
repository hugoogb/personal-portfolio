import { ROADS, roadRect } from "@/world/lib/map";
import { PALETTE } from "@/world/lib/palette";

export function Roads() {
  return (
    <group>
      {ROADS.map((road) => {
        const { cx, cz, w, d } = roadRect(road);
        return (
          <group key={road.id}>
            <mesh position={[cx, 0.025, cz]} receiveShadow>
              <boxGeometry args={[w + 0.5, 0.05, d + 0.5]} />
              <meshStandardMaterial color={PALETTE.walk} />
            </mesh>
            <mesh position={[cx, 0.035, cz]} receiveShadow>
              <boxGeometry args={[w, 0.07, d]} />
              <meshStandardMaterial color={PALETTE.road} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
