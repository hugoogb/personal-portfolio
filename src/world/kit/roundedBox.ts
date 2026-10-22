import * as THREE from "three";

const projected = new THREE.Vector3();
const normal = new THREE.Vector3();
const faceDir = new THREE.Vector3();
type Axis = "x" | "y" | "z";

/** three's RoundedBoxGeometry UV along one axis of a face, unchanged. */
const getUv = (uvAxis: Axis, projectionAxis: Axis, radius: number, sideLength: number) => {
  const totArcLength = (2 * Math.PI * radius) / 4;
  const centerLength = Math.max(sideLength - 2 * radius, 0);
  projected.copy(normal);
  projected[projectionAxis] = 0;
  projected.normalize();
  const arcUvRatio = (0.5 * totArcLength) / (totArcLength + centerLength);
  const arcAngleRatio = 1 - projected.angleTo(faceDir) / (Math.PI / 4);
  if (Math.sign(projected[uvAxis]) === 1) return arcAngleRatio * arcUvRatio;
  const lenUv = centerLength / (totArcLength + centerLength);
  return lenUv + arcUvRatio + arcUvRatio * (1 - arcAngleRatio);
};

/** A UV coordinate: the axis it runs along, the axis projected away, and whether it is flipped. */
type UvRule = [Axis, Axis, boolean];
/** Per face of BoxGeometry (+x, -x, +y, -y, +z, -z): its direction and its U and V rules. */
const FACES: { dir: [number, number, number]; u: UvRule; v: UvRule }[] = [
  { dir: [1, 0, 0], u: ["z", "y", false], v: ["y", "z", true] },
  { dir: [-1, 0, 0], u: ["z", "y", true], v: ["y", "z", true] },
  { dir: [0, 1, 0], u: ["x", "z", true], v: ["z", "x", false] },
  { dir: [0, -1, 0], u: ["x", "z", true], v: ["z", "x", true] },
  { dir: [0, 0, 1], u: ["x", "y", true], v: ["y", "x", true] },
  { dir: [0, 0, -1], u: ["x", "y", false], v: ["y", "x", true] },
];

const uvOf = ([axis, projection, flip]: UvRule, radius: number, sides: Record<Axis, number>) => {
  const t = getUv(axis, projection, radius, sides[axis]);
  return flip ? 1 - t : t;
};

export interface RoundedBoxParameters {
  width: number;
  height: number;
  depth: number;
  segments: number;
  radius: number;
}

/**
 * three's RoundedBoxGeometry (same positions, normals and UVs), kept indexed.
 * three's version unrolls the box into separate triangles: a 3-segment box
 * then carries 1,764 vertices instead of 384, all of them shaded on every
 * frame, and it cannot merge with the town's indexed boxes and spheres.
 */
export class RoundedBoxGeometry extends THREE.BufferGeometry {
  override readonly type = "RoundedBoxGeometry";
  parameters: RoundedBoxParameters;

  constructor(width = 1, height = 1, depth = 1, segments = 2, radius = 0.1) {
    super();
    radius = Math.min(width / 2, height / 2, depth / 2, radius);
    this.parameters = { width, height, depth, segments, radius };
    const total = segments * 2 + 1;
    const box = new THREE.BoxGeometry(1, 1, 1, total, total, total);
    this.setIndex(box.index);
    this.setAttribute("position", box.attributes.position);
    this.setAttribute("normal", box.attributes.normal);
    this.setAttribute("uv", box.attributes.uv);
    for (const g of box.groups) this.addGroup(g.start, g.count, g.materialIndex);
    if (total === 1) return;

    const inner = [width / 2 - radius, height / 2 - radius, depth / 2 - radius];
    const sides: Record<Axis, number> = { x: width, y: height, z: depth };
    const positions = this.attributes.position.array as Float32Array;
    const normals = this.attributes.normal.array as Float32Array;
    const uvs = this.attributes.uv.array as Float32Array;
    // Every face of the unit box has the same (total + 1)^2 grid of vertices.
    const perFace = (total + 1) * (total + 1);
    const half = 0.5 / total;
    for (let v = 0; v < positions.length / 3; v++) {
      const i = v * 3;
      normal.fromArray(positions, i);
      const sign = [Math.sign(normal.x), Math.sign(normal.y), Math.sign(normal.z)];
      normal.x -= sign[0] * half;
      normal.y -= sign[1] * half;
      normal.z -= sign[2] * half;
      normal.normalize();
      for (let k = 0; k < 3; k++)
        positions[i + k] = inner[k] * sign[k] + normal.getComponent(k) * radius;
      normal.toArray(normals, i);

      const face = FACES[Math.floor(v / perFace)];
      faceDir.fromArray(face.dir);
      uvs[v * 2] = uvOf(face.u, radius, sides);
      uvs[v * 2 + 1] = uvOf(face.v, radius, sides);
    }
  }
}
