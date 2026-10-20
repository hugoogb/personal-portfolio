/**
 * The three.js classes the town's JSX names (<group>, <mesh>, ...): R3F's Canvas
 * registers these and nothing else (vite.config.ts, threeCatalogue). Its stock
 * `extend(THREE)` registers the whole namespace, which keeps every class in the
 * bundle. A tag missing here fails at runtime with "R3F: X is not part of the
 * THREE namespace", so add a class here when the JSX starts using it.
 * <primitive> needs no entry. drei's Html and the effects composer use <group>.
 */
export {
  CylinderGeometry,
  DirectionalLight,
  Group,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  RingGeometry,
  SphereGeometry,
} from "three";
