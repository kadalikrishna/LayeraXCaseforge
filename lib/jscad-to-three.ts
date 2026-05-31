import { geometries } from "@jscad/modeling";
import * as THREE from "three";

type Vec3 = [number, number, number];
const { geom3 } = geometries;
type JscadGeom3 = Parameters<typeof geom3.toPolygons>[0];

export function jscadGeomToBufferGeometry(solid: JscadGeom3) {
  const positions: number[] = [];
  const normals: number[] = [];
  const polygons = geom3.toPolygons(solid);

  polygons.forEach((polygon) => {
    const vertices = polygon.vertices as Vec3[];
    if (vertices.length < 3) return;

    const normal = getNormal(vertices[0], vertices[1], vertices[2]);
    for (let index = 1; index < vertices.length - 1; index += 1) {
      pushVertex(positions, vertices[0]);
      pushVertex(positions, vertices[index]);
      pushVertex(positions, vertices[index + 1]);
      normals.push(...normal, ...normal, ...normal);
    }
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geometry.computeBoundingSphere();
  return geometry;
}

function pushVertex(target: number[], vertex: Vec3) {
  target.push(vertex[0], vertex[1], vertex[2]);
}

function getNormal(a: Vec3, b: Vec3, c: Vec3): Vec3 {
  const ab = new THREE.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
  const ac = new THREE.Vector3(c[0] - a[0], c[1] - a[1], c[2] - a[2]);
  const normal = ab.cross(ac).normalize();
  return [normal.x, normal.y, normal.z];
}
