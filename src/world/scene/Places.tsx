import { RoundedBox } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import { PLACES, PLACE_BY_ID } from "@/content/places";
import type { Place, PlaceId } from "@/content/types";
import { useBaseCamp } from "@/store/store";
import { wasDrag } from "@/world/lib/drag";
import { PALETTE } from "@/world/lib/palette";

type Shape = "building" | "track" | "pitch" | "board";
const SHAPE: Partial<Record<PlaceId, Shape>> = {
  f1: "track",
  stadium: "pitch",
  arena: "pitch",
  board: "board",
};

/** Greybox stand-ins sized from each place's map footprint. Phase 3 swaps in the real buildings. */
function Volume({ place, accent }: { place: Place; accent: string }) {
  const { r, top } = place.map;
  switch (SHAPE[place.id] ?? "building") {
    case "track":
      return (
        <group>
          <mesh rotation-x={-Math.PI / 2} position-y={0.06} receiveShadow>
            <ringGeometry args={[r * 0.55, r * 0.8, 48]} />
            <meshStandardMaterial color={PALETTE.road} />
          </mesh>
          <RoundedBox
            args={[r * 0.5, 0.6, 0.9]}
            radius={0.08}
            position={[0, 0.3, r * 0.35]}
            castShadow
          >
            <meshStandardMaterial color={place.color} />
          </RoundedBox>
        </group>
      );
    case "pitch":
      return (
        <group>
          <mesh position-y={0.05} receiveShadow>
            <boxGeometry args={[r * 1.5, 0.1, r]} />
            <meshStandardMaterial
              color={place.id === "arena" ? PALETTE.arenaFloor : PALETTE.pitch}
            />
          </mesh>
          {[-1, 1].map((side) => (
            <RoundedBox
              key={side}
              args={[r * 1.5, top * 0.35, 0.7]}
              radius={0.08}
              position={[0, top * 0.175, side * (r * 0.5 + 0.45)]}
              castShadow
            >
              <meshStandardMaterial color={place.color} />
            </RoundedBox>
          ))}
        </group>
      );
    case "board":
      return (
        <RoundedBox
          args={[1.4, top - 0.4, 0.25]}
          radius={0.06}
          position={[0, (top - 0.4) / 2, 0]}
          castShadow
        >
          <meshStandardMaterial color={PALETTE.board} />
        </RoundedBox>
      );
    default: {
      const size = r * 1.2;
      const wall = top - 1.1;
      return (
        <group>
          <RoundedBox
            args={[size, wall, size]}
            radius={0.12}
            position={[0, wall / 2, 0]}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial color={PALETTE.wall} />
          </RoundedBox>
          <RoundedBox
            args={[size + 0.3, 0.35, size + 0.3]}
            radius={0.1}
            position={[0, wall + 0.175, 0]}
            castShadow
          >
            {/* HQ's roof is "me", so it wears the visitor's accent (spec 5.2). */}
            <meshStandardMaterial color={place.id === "hq" ? accent : place.color} />
          </RoundedBox>
        </group>
      );
    }
  }
}

function PlaceNode({ place, accent }: { place: Place; accent: string }) {
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (wasDrag()) return;
    useBaseCamp.getState().select(place.id);
  };
  const onOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    useBaseCamp.getState().setHover(place.id);
    document.body.style.cursor = "pointer";
  };
  const onOut = () => {
    const s = useBaseCamp.getState();
    if (s.hover === place.id) s.setHover(null);
    document.body.style.cursor = "";
  };
  return (
    <group
      position={[place.map.x, 0, place.map.z]}
      onClick={onClick}
      onPointerOver={onOver}
      onPointerOut={onOut}
    >
      <Volume place={place} accent={accent} />
      {/* One generous hit volume per place; three.js raycasts invisible meshes. */}
      <mesh visible={false} position-y={Math.max(place.map.top, 1) / 2}>
        <cylinderGeometry args={[place.map.r, place.map.r, Math.max(place.map.top, 1), 16]} />
      </mesh>
    </group>
  );
}

function SelectionRing({ accent }: { accent: string }) {
  const selected = useBaseCamp((s) => s.selected);
  const ready = useBaseCamp((s) => s.introDone);
  if (!selected || !ready) return null;
  const { x, z, r } = PLACE_BY_ID[selected].map;
  return (
    <mesh rotation-x={-Math.PI / 2} position={[x, 0.08, z]}>
      <ringGeometry args={[r + 0.1, r + 0.28, 64]} />
      <meshBasicMaterial color={accent} transparent opacity={0.9} />
    </mesh>
  );
}

export function Places() {
  const accent = useBaseCamp((s) => s.accent);
  return (
    <group>
      {PLACES.map((place) => (
        <PlaceNode key={place.id} place={place} accent={accent} />
      ))}
      <SelectionRing accent={accent} />
    </group>
  );
}
