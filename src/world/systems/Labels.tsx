import { Html } from "@react-three/drei";
import { PLACE_BY_ID } from "@/content/places";
import type { PlaceId } from "@/content/types";
import { useBaseCamp } from "@/store/store";

/** Floating labels over the hovered and the selected place (spec 4.3). */
export function Labels() {
  const hover = useBaseCamp((s) => s.hover);
  const selected = useBaseCamp((s) => s.selected);
  const ready = useBaseCamp((s) => s.introDone);
  if (!ready) return null;
  const ids = [...new Set([selected, hover].filter(Boolean))] as PlaceId[];
  return (
    <>
      {ids.map((id) => {
        const place = PLACE_BY_ID[id];
        return (
          <Html
            key={id}
            position={[place.map.x, place.map.top + 0.4, place.map.z]}
            center
            zIndexRange={[20, 0]}
            pointerEvents="none"
          >
            <span className={`place-label${id === selected ? " is-selected" : ""}`}>
              {place.label ?? place.name}
            </span>
          </Html>
        );
      })}
    </>
  );
}
