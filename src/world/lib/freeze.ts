import type * as THREE from "three";

/**
 * Stops three recomposing, every frame, the matrix of everything under `root`
 * that never moves: it is composed once here. A `userData.dynamic` object and
 * everything on it keep updating. Call it once the build-in has settled the
 * town, since the build-in scales and raises static parts. Returns how many
 * objects were frozen.
 */
export function freezeStatic(root: THREE.Object3D): number {
  if (root.userData.dynamic) return 0;
  root.updateMatrix();
  root.matrixAutoUpdate = false;
  let frozen = 1;
  for (const child of root.children) frozen += freezeStatic(child);
  return frozen;
}
