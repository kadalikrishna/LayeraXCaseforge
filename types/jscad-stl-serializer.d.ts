declare module "@jscad/stl-serializer" {
  import type { Geom3 } from "@jscad/modeling/src/geometries/types";
  export function serialize(options: { binary?: boolean }, ...objects: Geom3[]): ArrayBuffer[];
}
