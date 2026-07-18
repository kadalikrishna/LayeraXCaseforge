import { geometries } from "@jscad/modeling";
import type { Geom3 } from "@jscad/modeling/src/geometries/types";
import * as THREE from "three";

type Vec3 = [number, number, number];

export function toBufferGeometry(solid: Geom3) {
  const positions: number[] = [];
  geometries.geom3.toPolygons(solid).forEach((polygon) => {
    const vertices = polygon.vertices as Vec3[];
    for (let index = 1; index < vertices.length - 1; index += 1) positions.push(...vertices[0], ...vertices[index], ...vertices[index + 1]);
  });
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}
