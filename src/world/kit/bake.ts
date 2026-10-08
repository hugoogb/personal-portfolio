import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

const signature = (g: THREE.BufferGeometry) =>
  Object.keys(g.attributes).sort().join(",") + (g.index ? "|i" : "|n");

export interface BakeOptions {
  /** Materials that something repaints or animates: never colour-merged. */
  keep?: Set<THREE.Material>;
  /** Registers merged geometry and shared materials so their owner disposes them. */
  own?: (x: THREE.Material | THREE.BufferGeometry) => void;
  /**
   * Draws every shadow caster's geometry as ONE invisible mesh that casts the
   * shadow, and stops the coloured merged meshes from casting. The shadow pass
   * then costs one draw per root instead of one per bucket.
   */
  shadowProxy?: boolean;
}

const noOwn = () => {};
/** Bounding radius under which a mesh is left out of the shadow proxy. */
const TINY = 0.1;
/** One shared vertex-colour material per parameter set, per owner. */
const shared = new WeakMap<object, Map<string, THREE.MeshStandardMaterial>>();
/** One invisible shadow-caster material per owner. */
const proxies = new WeakMap<object, THREE.MeshBasicMaterial>();

const isPlain = (m: THREE.Material): m is THREE.MeshStandardMaterial => {
  if (m.type !== "MeshStandardMaterial") return false;
  const s = m as THREE.MeshStandardMaterial;
  return !s.map && !s.emissiveMap && !s.transparent && !s.vertexColors && s.emissive.getHex() === 0;
};

/**
 * Merges every static mesh under `root` that shares a material (and shadow
 * flag, render order and attribute layout) into one mesh. Plain opaque
 * materials (no map, no emissive, not in `opts.keep`) are merged by roughness
 * and metalness instead: their colour moves into a vertex colour on one
 * shared material, and the geometry is expressed in `root`'s space. Subtrees
 * marked `userData.dynamic` and instanced meshes are left alone. Returns how
 * many meshes were merged away. This is how the town fits spec 10's
 * draw-call budget.
 */
export function bakeStatic(root: THREE.Object3D, opts: BakeOptions = {}): number {
  const own = opts.own ?? noOwn;
  const cache = shared.get(own) ?? shared.set(own, new Map()).get(own)!;
  root.updateMatrixWorld(true);
  const toRoot = new THREE.Matrix4().copy(root.matrixWorld).invert();
  const buckets = new Map<
    string,
    {
      material: THREE.Material;
      cast: boolean;
      geos: THREE.BufferGeometry[];
      shadows: THREE.BufferGeometry[];
      meshes: THREE.Mesh[];
    }
  >();
  const visit = (o: THREE.Object3D) => {
    if (o !== root && o.userData.dynamic) return;
    for (const child of o.children) visit(child);
    const mesh = o as THREE.Mesh;
    if (
      !mesh.isMesh ||
      (mesh as THREE.InstancedMesh).isInstancedMesh ||
      Array.isArray(mesh.material) ||
      mesh === root
    ) {
      return;
    }
    const toRootM = new THREE.Matrix4().multiplyMatrices(toRoot, mesh.matrixWorld);
    const geo = mesh.geometry.clone().applyMatrix4(toRootM);
    const shadowGeo = mesh.castShadow ? (coarse(mesh.geometry)?.applyMatrix4(toRootM) ?? geo) : geo;
    let material = mesh.material;
    let matKey = material.uuid;
    if (isPlain(material) && !opts.keep?.has(material)) {
      const n = geo.attributes.position.count;
      const col = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) material.color.toArray(col, i * 3);
      geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
      matKey = `vc|${material.roughness}|${material.metalness}|${material.side}|${material.flatShading}`;
      let vc = cache.get(matKey);
      if (!vc) {
        vc = new THREE.MeshStandardMaterial({
          vertexColors: true,
          roughness: material.roughness,
          metalness: material.metalness,
          side: material.side,
          flatShading: material.flatShading,
        });
        own(vc);
        cache.set(matKey, vc);
      }
      material = vc;
    }
    const key = `${matKey}|${mesh.castShadow}|${mesh.renderOrder}|${signature(geo)}`;
    let b = buckets.get(key);
    if (!b) {
      buckets.set(
        key,
        (b = { material, cast: mesh.castShadow, geos: [], shadows: [], meshes: [] }),
      );
    }
    b.geos.push(geo);
    shadowGeo.computeBoundingSphere();
    // Specks cast no shadow worth drawing at this zoom.
    if (shadowGeo.boundingSphere!.radius >= TINY) b.shadows.push(shadowGeo);
    b.meshes.push(mesh);
  };
  visit(root);
  let removed = 0;
  const casters: { mesh: THREE.Mesh; shadows: THREE.BufferGeometry[] }[] = [];
  for (const b of buckets.values()) {
    const merged = mergeGeometries(b.geos, false);
    // The per-mesh clones are dropped; the original meshes stay as they were.
    for (const g of b.geos) g.dispose();
    if (!merged) continue;
    own(merged);
    for (const m of b.meshes) m.removeFromParent();
    removed += b.meshes.length;
    const out = new THREE.Mesh(merged, b.material);
    out.castShadow = b.cast;
    out.receiveShadow = true;
    out.renderOrder = b.meshes[0].renderOrder;
    root.add(out);
    if (b.cast) casters.push({ mesh: out, shadows: b.shadows });
  }
  if (opts.shadowProxy && casters.length > 1) {
    const geo = shadowGeometry(casters.flatMap((c) => c.shadows));
    own(geo);
    let mat = proxies.get(own);
    if (!mat) {
      mat = new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false });
      own(mat);
      proxies.set(own, mat);
    }
    const proxy = new THREE.Mesh(geo, mat);
    proxy.castShadow = true;
    proxy.receiveShadow = false;
    root.add(proxy);
    for (const c of casters) c.mesh.castShadow = false;
  }
  return removed;
}

/**
 * A shadow needs no rounded corners and few facets: round-cornered boxes cast
 * as plain boxes, curved solids as 6-sided ones. Null when the shape is kept.
 */
function coarse(g: THREE.BufferGeometry): THREE.BufferGeometry | null {
  const p = (g as THREE.BufferGeometry & { parameters?: Record<string, number | boolean> })
    .parameters;
  if (!p) return null;
  switch (g.type) {
    case "RoundedBoxGeometry":
      return new THREE.BoxGeometry(p.width as number, p.height as number, p.depth as number);
    case "SphereGeometry":
      return new THREE.SphereGeometry(
        p.radius as number,
        Math.min(p.widthSegments as number, 6),
        Math.min(p.heightSegments as number, 4),
        p.phiStart as number,
        p.phiLength as number,
        p.thetaStart as number,
        p.thetaLength as number,
      );
    case "CylinderGeometry":
      return new THREE.CylinderGeometry(
        p.radiusTop as number,
        p.radiusBottom as number,
        p.height as number,
        Math.min(p.radialSegments as number, 6),
        1,
        p.openEnded as boolean,
        p.thetaStart as number,
        p.thetaLength as number,
      );
    case "ConeGeometry":
      return new THREE.ConeGeometry(
        p.radius as number,
        p.height as number,
        Math.min(p.radialSegments as number, 6),
        1,
        p.openEnded as boolean,
        p.thetaStart as number,
        p.thetaLength as number,
      );
    case "CapsuleGeometry":
      return new THREE.CapsuleGeometry(p.radius as number, p.height as number, 2, 6);
    default:
      return null;
  }
}

/** Positions and indices only: all a shadow map needs. */
function shadowGeometry(geos: THREE.BufferGeometry[]): THREE.BufferGeometry {
  let verts = 0;
  let idx = 0;
  for (const g of geos) {
    verts += g.attributes.position.count;
    idx += g.index ? g.index.count : g.attributes.position.count;
  }
  const pos = new Float32Array(verts * 3);
  const index = new Uint32Array(idx);
  let v = 0;
  let i = 0;
  for (const g of geos) {
    const p = g.attributes.position;
    for (let k = 0; k < p.count; k++) {
      pos[(v + k) * 3] = p.getX(k);
      pos[(v + k) * 3 + 1] = p.getY(k);
      pos[(v + k) * 3 + 2] = p.getZ(k);
    }
    const n = g.index ? g.index.count : p.count;
    for (let k = 0; k < n; k++) index[i++] = v + (g.index ? g.index.getX(k) : k);
    v += p.count;
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  out.setIndex(new THREE.BufferAttribute(index, 1));
  return out;
}
