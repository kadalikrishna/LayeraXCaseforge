import { geometries, modifiers } from "@jscad/modeling";
import type { Geom3 } from "@jscad/modeling/src/geometries/types";

// JSCAD 2.13 ships an incorrect default-export declaration for this CJS function.
const generalizeMesh = modifiers.generalize as unknown as (options: { snap: boolean; triangulate: boolean }, solid: Geom3) => Geom3;

export function meshPositions(solid: Geom3): Float32Array {
  const polygons = geometries.geom3.toPolygons(generalizeMesh({ snap: true, triangulate: true }, solid));
  const count = polygons.reduce((sum, polygon) => sum + Math.max(0, polygon.vertices.length - 2) * 9, 0);
  const positions = new Float32Array(count);
  let offset = 0;
  for (const polygon of polygons) for (let i = 1; i < polygon.vertices.length - 1; i++) {
    for (const vertex of [polygon.vertices[0], polygon.vertices[i], polygon.vertices[i + 1]]) {
      positions[offset++] = vertex[0]; positions[offset++] = vertex[1]; positions[offset++] = vertex[2];
    }
  }
  return positions;
}
