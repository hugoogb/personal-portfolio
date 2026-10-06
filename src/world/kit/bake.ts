import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

const signature = (g: THREE.BufferGeometry) =>
  Object.keys(g.attributes).sort().join(",") + (g.index ? "|i" : "|n");

export interface BakeOptions {
  /** Materials that something repaints or animates: never colour-merged. */
  keep?: Set<THREE.Material>;
  /** Registers the shared vertex-colour materials so their owner disposes them. */
  own?: (m: THREE.Material) => void;
}

const noOwn = () => {};
/** One shared vertex-colour material per parameter set, per owner. */
const shared = new WeakMap<object, Map<string, THREE.MeshStandardMaterial>>();

const isPlain = (m: THREE.Material): m is THREE.MeshStandardMaterial => {
  if (m.type !== "MeshStandardMaterial") return false;
  const s = m as THREE.MeshStandardMaterial;
  return !s.map && !s.emissiveMap && !s.transparent && !s.vertexColors && s.emissive.getHex() === 0;
};

/**
 * Merges every static mesh under `root` that shares a material (and shadow
 * flag, and attribute layout) into one mesh. Plain opaque materials (no map,
 * no emissive, not in `opts.keep`) are merged by roughness and metalness
 * instead, their colour moving into a vertex colour on one shared material, in `root`'s space. Subtrees marked
 * `userData.dynamic` and instanced meshes are left alone. Returns how many
 * meshes were merged away. This is how the town fits spec 10's draw-call budget.
 */
export function bakeStatic(root: THREE.Object3D, opts: BakeOptions = {}): number {
  const own = opts.own ?? noOwn;
  const cache = shared.get(own) ?? shared.set(own, new Map()).get(own)!;
  root.updateMatrixWorld(true);
  const toRoot = new THREE.Matrix4().copy(root.matrixWorld).invert();
  const buckets = new Map<
    string,
    { material: THREE.Material; cast: boolean; geos: THREE.BufferGeometry[]; meshes: THREE.Mesh[] }
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
    const geo = mesh.geometry
      .clone()
      .applyMatrix4(new THREE.Matrix4().multiplyMatrices(toRoot, mesh.matrixWorld));
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
    if (!b) buckets.set(key, (b = { material, cast: mesh.castShadow, geos: [], meshes: [] }));
    b.geos.push(geo);
    b.meshes.push(mesh);
  };
  visit(root);
  let removed = 0;
  for (const b of buckets.values()) {
    const merged = mergeGeometries(b.geos, false);
    if (!merged) continue;
    for (const m of b.meshes) m.removeFromParent();
    removed += b.meshes.length;
    const out = new THREE.Mesh(merged, b.material);
    out.castShadow = b.cast;
    out.receiveShadow = true;
    out.renderOrder = b.meshes[0].renderOrder;
    root.add(out);
  }
  return removed;
}
