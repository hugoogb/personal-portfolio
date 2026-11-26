import type * as THREE from "three";

export function freezeStatic(root: THREE.Object3D): number {
  if (root.userData.dynamic) return 0;
  root.updateMatrix();
  root.matrixAutoUpdate = false;
  let frozen = 1;
  for (const child of root.children) frozen += freezeStatic(child);
  return frozen;
}
