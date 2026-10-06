import type { ThreeEvent } from "@react-three/fiber";
import type * as THREE from "three";
import { PLACES, PLACE_BY_ID } from "@/content/places";
import type { Place, PlaceId } from "@/content/types";
import { useBaseCamp } from "@/store/store";
import { eggUnderPointer } from "@/world/lib/eggs";
import { wasDrag } from "@/world/lib/drag";

function PlaceNode({ place, object }: { place: Place; object: THREE.Group }) {
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    if (eggUnderPointer(e.intersections)) return;
    e.stopPropagation();
    if (wasDrag() || useBaseCamp.getState().driving) return;
    useBaseCamp.getState().select(place.id);
  };
  const onOver = (e: ThreeEvent<PointerEvent>) => {
    if (eggUnderPointer(e.intersections)) return;
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
    <group position={[place.map.x, 0, place.map.z]}>
      <primitive object={object} />
      {/* One generous hit volume per place; three.js raycasts invisible meshes. The
          handlers live on it alone, so the place's own parts (the straw hat, the
          caravel, the buoys) are not picked as the place. */}
      <mesh
        visible={false}
        position-y={Math.max(place.map.top, 1) / 2}
        onClick={onClick}
        onPointerOver={onOver}
        onPointerOut={onOut}
      >
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

export function Places({ places }: { places: Record<PlaceId, THREE.Group> }) {
  const accent = useBaseCamp((s) => s.accent);
  return (
    <group>
      {PLACES.map((place) => (
        <PlaceNode key={place.id} place={place} object={places[place.id]} />
      ))}
      <SelectionRing accent={accent} />
    </group>
  );
}
