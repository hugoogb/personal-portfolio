import { RoundedBox } from "@react-three/drei";
import { HOMES } from "@/world/lib/map";
import { PALETTE } from "@/world/lib/palette";

/** Ordinary homes: walls and a hip roof. Not selectable. */
export function Homes() {
  return (
    <group>
      {HOMES.map(([x, z], i) => (
        <group key={`${x},${z}`} position={[x, 0, z]}>
          <RoundedBox
            args={[1.6, 1.2, 1.4]}
            radius={0.1}
            position={[0, 0.6, 0]}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial color={PALETTE.homeWalls[i % PALETTE.homeWalls.length]} />
          </RoundedBox>
          <mesh position={[0, 1.55, 0]} rotation-y={Math.PI / 4} castShadow>
            <coneGeometry args={[1.25, 0.7, 4]} />
            <meshStandardMaterial color={PALETTE.homeRoofs[i % PALETTE.homeRoofs.length]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
