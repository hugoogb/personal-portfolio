import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

const signature = (g: THREE.BufferGeometry) =>
  Object.keys(g.attributes).sort().join(",") + (g.index ? "|i" : "|n");

/**
 * Merges every static mesh under `root` that shares a material (and shadow
 * flag, and attribute layout) into one mesh, in `root`'s space. Subtrees marked
 * `userData.dynamic` and instanced meshes are left alone. Returns how many
 * meshes were merged away. This is how the town fits spec 10's draw-call budget.
 */
export function bakeStatic(root: THREE.Object3D): number {
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
    const key = `${mesh.material.uuid}|${mesh.castShadow}|${mesh.renderOrder}|${signature(geo)}`;
    let b = buckets.get(key);
    if (!b)
      buckets.set(
        key,
        (b = { material: mesh.material, cast: mesh.castShadow, geos: [], meshes: [] }),
      );
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
