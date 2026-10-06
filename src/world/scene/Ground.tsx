import { RoundedBox } from "@react-three/drei";
import { ISLAND } from "@/world/lib/map";
import { PALETTE } from "@/world/lib/palette";

/** The island (grass top at y = 0), a sand rim and the sea. */
export function Ground() {
  return (
    <group>
      <RoundedBox
        args={[ISLAND.hx * 2, 1.2, ISLAND.hz * 2]}
        radius={0.45}
        smoothness={4}
        position={[0, -0.6, 0]}
        receiveShadow
      >
        <meshStandardMaterial color={PALETTE.grass} roughness={0.9} />
      </RoundedBox>
      <RoundedBox
        args={[ISLAND.hx * 2 + 1.6, 1.1, ISLAND.hz * 2 + 1.6]}
        radius={0.5}
        smoothness={4}
        position={[0, -0.62, 0]}
        receiveShadow
      >
        <meshStandardMaterial color={PALETTE.sand} roughness={0.95} />
      </RoundedBox>
      <mesh rotation-x={-Math.PI / 2} position-y={-0.38} receiveShadow>
        <planeGeometry args={[260, 260]} />
        <meshStandardMaterial color={PALETTE.water} roughness={0.2} />
      </mesh>
    </group>
  );
}
