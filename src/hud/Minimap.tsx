import type { MouseEvent } from "react";
import { PLACES } from "@/content/places";
import { MINIMAP_SIZE, clientToMap, fromMap, toMap } from "@/hud/minimap";
import { useBaseCamp } from "@/store/store";
import { viewPolygon } from "@/world/lib/camera";
import { ISLAND, ROADS } from "@/world/lib/map";

const points = (pts: { x: number; y: number }[]) =>
  pts.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");

/** Turned 45 degrees so "up" matches the view; a click moves the camera there (spec 4.1). */
export function Minimap() {
  const view = useBaseCamp((s) => s.view);
  const discovered = useBaseCamp((s) => s.discovered);
  const selected = useBaseCamp((s) => s.selected);
  const focus = useBaseCamp((s) => s.focus);
  const half = MINIMAP_SIZE / 2;
  const frame = viewPolygon(view.x, view.z, view.view, view.aspect).map((p) => toMap(p.x, p.z));
  const islandOutline = points(
    [
      [-ISLAND.hx, -ISLAND.hz],
      [ISLAND.hx, -ISLAND.hz],
      [ISLAND.hx, ISLAND.hz],
      [-ISLAND.hx, ISLAND.hz],
    ].map(([x, z]) => toMap(x, z)),
  );

  const onClick = (e: MouseEvent<SVGSVGElement>) => {
    const m = clientToMap(e.clientX, e.clientY, e.currentTarget.getBoundingClientRect());
    const g = fromMap(m.x, m.y);
    focus(g.x, g.z, view.view);
  };

  return (
    <div className="minimap glass" aria-hidden="true">
      <svg viewBox={`${-half} ${-half} ${MINIMAP_SIZE} ${MINIMAP_SIZE}`} onClick={onClick}>
        <polygon className="minimap__island" points={islandOutline} />
        {ROADS.map((r) => {
          const a = toMap(r.from[0], r.from[1]);
          const b = toMap(r.to[0], r.to[1]);
          return <line key={r.id} className="minimap__road" x1={a.x} y1={a.y} x2={b.x} y2={b.y} />;
        })}
        {PLACES.map((p) => {
          const m = toMap(p.map.x, p.map.z);
          const found = discovered.includes(p.id);
          return (
            <circle
              key={p.id}
              cx={m.x}
              cy={m.y}
              r={Math.max(0.9, p.map.r * 0.35)}
              className={`minimap__place${found ? " is-found" : ""}${selected === p.id ? " is-selected" : ""}`}
              style={{ fill: p.color }}
            />
          );
        })}
        <polygon className="minimap__view" points={points(frame)} />
      </svg>
    </div>
  );
}
